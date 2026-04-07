import { ref } from 'vue'
import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

/**
 * Gemini API 封装 composable
 * 支持流式输出和多轮对话
 */
export function useGemini() {
  const loading = ref(false)
  const error = ref(null)
  const streamingText = ref('')

  let genAI = null
  let chatSession = null

  function init(systemPrompt) {
    genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    })
    chatSession = model.startChat({ history: [] })
  }

  /**
   * 发送消息并流式接收回复
   * @param {string} message - 用户消息
   * @param {function} onChunk - 每次收到新文本时的回调 (fullText) => void
   * @returns {Promise<string>} 完整回复文本
   */
  async function sendMessageStream(message, onChunk) {
    if (!chatSession) throw new Error('请先调用 init() 初始化')
    loading.value = true
    error.value = null
    streamingText.value = ''

    try {
      const result = await chatSession.sendMessageStream(message)
      let fullText = ''
      for await (const chunk of result.stream) {
        const text = chunk.text()
        fullText += text
        streamingText.value = fullText
        if (onChunk) onChunk(fullText)
      }
      loading.value = false
      return fullText
    } catch (e) {
      error.value = e.message || '请求失败'
      loading.value = false
      throw e
    }
  }

  /**
   * 单次请求（非对话模式），用于生成报告
   * @param {string} prompt
   * @param {function} onChunk
   * @returns {Promise<string>}
   */
  async function generateStream(prompt, onChunk) {
    if (!genAI) throw new Error('请先调用 init() 初始化')
    loading.value = true
    error.value = null
    streamingText.value = ''

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.3, // 报告用低温度保证稳定性
          maxOutputTokens: 4096,
        },
      })
      const result = await model.generateContentStream(prompt)
      let fullText = ''
      for await (const chunk of result.stream) {
        const text = chunk.text()
        fullText += text
        streamingText.value = fullText
        if (onChunk) onChunk(fullText)
      }
      loading.value = false
      return fullText
    } catch (e) {
      error.value = e.message || '请求失败'
      loading.value = false
      throw e
    }
  }

  return {
    loading,
    error,
    streamingText,
    init,
    sendMessageStream,
    generateStream,
  }
}
