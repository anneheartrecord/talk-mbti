import { ref, computed } from 'vue'
import { useGemini } from './useGemini'
import { buildChatSystemPrompt, buildReportPrompt } from '../prompts/system'
import { END_KEYWORDS } from '../constants/tags'
import { saveResult } from '../lib/supabase'

/**
 * 对话状态管理 composable
 */
export function useChat() {
  const messages = ref([]) // [{role: 'user'|'assistant', content: string}]
  const userTags = ref({})
  const currentRound = ref(0)
  const maxRounds = ref(30) // 可调轮次
  const isFinished = ref(false)
  const isGeneratingReport = ref(false)
  const report = ref(null)
  const canSkip = computed(() => currentRound.value >= 10) // 10轮后可跳过
  const gemini = useGemini()

  const progress = computed(() => Math.min((currentRound.value / maxRounds.value) * 100, 100))

  function initChat(tags, rounds = 30) {
    userTags.value = tags
    messages.value = []
    currentRound.value = 0
    maxRounds.value = rounds
    isFinished.value = false
    report.value = null

    const systemPrompt = buildChatSystemPrompt(tags, rounds)
    gemini.init(systemPrompt)
  }

  function isEndCommand(text) {
    const trimmed = text.trim().toLowerCase()
    return END_KEYWORDS.some(kw => trimmed.includes(kw.toLowerCase()))
  }

  /**
   * 发送消息
   * 注意：这里不 push assistant 消息！由调用方通过 onChunk 回调管理。
   * onChunk 会在流式输出时被调用，调用方负责创建/更新 assistant 消息。
   */
  async function sendMessage(text, onChunk) {
    // 添加用户消息
    messages.value.push({ role: 'user', content: text })
    currentRound.value++

    // 检查是否是结束指令
    if (isEndCommand(text)) {
      return await generateReport()
    }

    // 检查是否到达轮次上限
    if (currentRound.value >= maxRounds.value) {
      // 最后一轮正常对话，然后生成报告
      await gemini.sendMessageStream(text, onChunk)
      return await generateReport()
    }

    // 正常对话（不 push assistant 消息，由 onChunk 回调处理）
    const reply = await gemini.sendMessageStream(text, onChunk)
    return reply
  }

  /**
   * 获取 AI 开场白（同样不 push，由调用方处理）
   */
  async function getGreeting(onChunk) {
    const greeting = await gemini.sendMessageStream(
      '[系统指令：请根据用户的标签信息，发出第一句打招呼的话，自然开启对话。不要暴露你在做分析。]',
      onChunk
    )
    return greeting
  }

  async function generateReport() {
    isFinished.value = true
    isGeneratingReport.value = true

    try {
      const prompt = buildReportPrompt(userTags.value, messages.value)
      const rawText = await gemini.generateStream(prompt)

      // 提取 JSON
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        report.value = JSON.parse(jsonStr)
      } else {
        throw new Error('无法解析报告 JSON')
      }
    } catch (e) {
      console.error('报告生成失败:', e)
      // 重试一次
      try {
        const prompt = buildReportPrompt(userTags.value, messages.value)
        const rawText = await gemini.generateStream(prompt)
        const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0]
          report.value = JSON.parse(jsonStr)
        }
      } catch (e2) {
        console.error('报告重试也失败:', e2)
      }
    } finally {
      isGeneratingReport.value = false
    }

    // 异步保存到 Supabase（不阻塞 UI）
    if (report.value) {
      saveResult(report.value, messages.value, userTags.value, currentRound.value)
        .then(id => { if (id) console.log('[Supabase] 已保存, id:', id) })
        .catch(e => console.warn('[Supabase] 保存失败:', e))
    }

    return report.value
  }

  return {
    messages,
    userTags,
    currentRound,
    maxRounds,
    progress,
    isFinished,
    isGeneratingReport,
    canSkip,
    report,
    loading: gemini.loading,
    error: gemini.error,
    streamingText: gemini.streamingText,
    initChat,
    sendMessage,
    getGreeting,
    generateReport,
    isEndCommand,
  }
}
