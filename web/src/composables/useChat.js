import { ref, computed, reactive } from 'vue'
import { useGemini } from './useGemini'
import { buildChatSystemPrompt, buildReportPrompt } from '../prompts/system'
import { END_KEYWORDS } from '../constants/tags'

/**
 * 对话状态管理 composable
 * 管理整个对话流程：初始化 → 聊天 → 结束 → 生成报告
 */
export function useChat() {
  const messages = ref([]) // [{role: 'user'|'assistant', content: string}]
  const userTags = ref({})
  const currentRound = ref(0)
  const maxRounds = 30
  const isFinished = ref(false)
  const isGeneratingReport = ref(false)
  const report = ref(null)
  const gemini = useGemini()

  const progress = computed(() => Math.min((currentRound.value / maxRounds) * 100, 100))

  /**
   * 初始化对话
   * @param {Object} tags - 用户选择的标签
   */
  function initChat(tags) {
    userTags.value = tags
    messages.value = []
    currentRound.value = 0
    isFinished.value = false
    report.value = null

    const systemPrompt = buildChatSystemPrompt(tags)
    gemini.init(systemPrompt)
  }

  /**
   * 检查用户输入是否是结束指令
   */
  function isEndCommand(text) {
    const trimmed = text.trim().toLowerCase()
    return END_KEYWORDS.some(kw => trimmed.includes(kw.toLowerCase()))
  }

  /**
   * 发送消息
   * @param {string} text - 用户输入
   * @param {function} onChunk - 流式回调
   * @returns {Promise<string|object>} 回复文本或报告对象
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
    if (currentRound.value >= maxRounds) {
      // 先发最后一轮消息
      const reply = await gemini.sendMessageStream(text, onChunk)
      messages.value.push({ role: 'assistant', content: reply })
      // 然后生成报告
      return await generateReport()
    }

    // 正常对话
    const reply = await gemini.sendMessageStream(text, onChunk)
    messages.value.push({ role: 'assistant', content: reply })
    return reply
  }

  /**
   * 获取 AI 的开场白
   */
  async function getGreeting(onChunk) {
    const greeting = await gemini.sendMessageStream(
      '[系统指令：请根据用户的标签信息，发出第一句打招呼的话，自然开启对话。不要暴露你在做分析。]',
      onChunk
    )
    messages.value.push({ role: 'assistant', content: greeting })
    return greeting
  }

  /**
   * 生成最终报告
   */
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
      // 回退：尝试再生成一次
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
