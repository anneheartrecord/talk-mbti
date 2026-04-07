<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- 顶部固定栏 -->
    <header class="flex-shrink-0 bg-[#6C5CE7] px-4 py-3 flex items-center gap-3 safe-top">
      <!-- 返回按钮 -->
      <button
        @click="$router.back()"
        class="text-white text-xl leading-none cursor-pointer"
      >
        ←
      </button>

      <!-- 中间标题 -->
      <span class="text-white font-semibold text-base flex-shrink-0">
        聊天中 ({{ currentRound }}/{{ maxRounds }})
      </span>

      <!-- 进度条 -->
      <div class="flex-1 min-w-0">
        <ProgressBar :current="currentRound" :max="maxRounds" :progress="progress" />
      </div>
    </header>

    <!-- 消息区域 -->
    <main
      ref="messageContainer"
      class="flex-1 overflow-y-auto px-4 py-4 space-y-1"
    >
      <!-- 报告生成中提示 -->
      <div v-if="isGeneratingReport" class="flex flex-col items-center justify-center py-20 gap-4">
        <div class="text-4xl animate-spin-slow">🔮</div>
        <p class="text-gray-500 text-sm">正在生成你的 MBTI 报告...</p>
      </div>

      <template v-else>
        <ChatBubble
          v-for="(msg, idx) in messages"
          :key="idx"
          :message="msg"
          :isStreaming="idx === messages.length - 1 && msg.role === 'assistant' && loading"
        />

        <!-- 流式输出中：如果最后一条不是 assistant（即 AI 还没开始回复），显示打字指示器 -->
        <TypingIndicator
          v-if="loading && (messages.length === 0 || messages[messages.length - 1].role !== 'assistant' || !streamingText)"
        />
      </template>
    </main>

    <!-- 底部输入栏 -->
    <footer class="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3 safe-bottom">
      <!-- 错误提示 -->
      <div v-if="error" class="text-red-500 text-xs mb-2 px-1">
        {{ error }}
      </div>

      <div class="flex items-end gap-2">
        <textarea
          ref="inputRef"
          v-model="inputText"
          :disabled="loading || isFinished"
          @keydown="handleKeydown"
          rows="1"
          :placeholder="loading ? 'AI 正在回复...' : '输入消息...'"
          class="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2.5 text-[15px] leading-snug max-h-32 overflow-y-auto focus:outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]/30 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
        />
        <button
          @click="handleSend"
          :disabled="loading || isFinished || !inputText.trim()"
          class="flex-shrink-0 w-10 h-10 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center text-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          ↑
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChat } from '../composables/useChat'
import ChatBubble from '../components/ChatBubble.vue'
import TypingIndicator from '../components/TypingIndicator.vue'
import ProgressBar from '../components/ProgressBar.vue'

const router = useRouter()
const inputText = ref('')
const inputRef = ref(null)
const messageContainer = ref(null)

const {
  messages,
  currentRound,
  maxRounds,
  progress,
  isFinished,
  isGeneratingReport,
  loading,
  streamingText,
  error,
  initChat,
  sendMessage,
  getGreeting,
  isEndCommand,
  generateReport,
  report,
} = useChat()

// 自动滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

// 监听消息变化和流式文本变化，自动滚底
watch([messages, streamingText], scrollToBottom, { deep: true })

// 监听 isFinished，跳转 /report
watch(isFinished, (val) => {
  if (!val) return
  // 等待报告生成完成
  const unwatch = watch(isGeneratingReport, (generating) => {
    if (!generating && report.value) {
      sessionStorage.setItem('mbti_report', JSON.stringify(report.value))
      sessionStorage.setItem('mbti_messages', JSON.stringify(messages.value))
      unwatch()
      router.push('/report')
    }
  }, { immediate: true })
})

// 流式回调：更新最后一条 assistant 消息的 content
function onChunk(chunk) {
  const last = messages.value[messages.value.length - 1]
  if (last && last.role === 'assistant') {
    last.content = chunk
  } else {
    // AI 还没有消息，创建一条
    messages.value.push({ role: 'assistant', content: chunk })
  }
}

// 发送消息
async function handleSend() {
  const text = inputText.value.trim()
  if (!text || loading.value || isFinished.value) return

  inputText.value = ''

  // 如果是结束指令，提前显示生成提示
  if (isEndCommand(text)) {
    messages.value.push({ role: 'user', content: text })
    await generateReport()
    return
  }

  await sendMessage(text, onChunk)
}

// Enter 发送，Shift+Enter 换行
function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// textarea 自适应高度
watch(inputText, () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = inputRef.value.scrollHeight + 'px'
    }
  })
})

// 初始化
onMounted(async () => {
  const tagsStr = sessionStorage.getItem('mbti_tags')
  if (!tagsStr) {
    router.replace('/tags')
    return
  }

  const tags = JSON.parse(tagsStr)
  initChat(tags)

  // 获取 AI 开场白
  await getGreeting(onChunk)
})
</script>

<style>
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow { animation: spin-slow 2s linear infinite; }

/* 安全区域适配 */
.safe-top { padding-top: max(0.75rem, env(safe-area-inset-top)); }
.safe-bottom { padding-bottom: max(0.75rem, env(safe-area-inset-bottom)); }
</style>
