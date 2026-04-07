<template>
  <!-- 全屏背景 + 居中容器 -->
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <!-- 主容器卡片：模拟手机界面 -->
    <div class="w-full max-w-xl h-[90vh] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">

      <!-- 顶部栏 -->
      <header class="shrink-0 px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <button
          @click="$router.back()"
          class="text-gray-400 hover:text-gray-700 text-sm cursor-pointer transition-colors"
        >
          ← 返回
        </button>

        <span class="text-gray-400 text-sm tabular-nums">{{ currentRound }} / {{ maxRounds }}</span>

        <button
          v-if="canSkip && !isFinished"
          @click="handleSkipToReport"
          class="text-purple-500 hover:text-purple-700 text-sm font-medium cursor-pointer transition-colors"
        >
          出报告 →
        </button>
        <span v-else class="w-16"></span>
      </header>

      <!-- 进度条 -->
      <div class="h-0.5 bg-gray-50 shrink-0">
        <div
          class="h-full bg-gray-800 transition-all duration-700 ease-out"
          :style="{ width: progress + '%' }"
        ></div>
      </div>

      <!-- 消息区域：flex-1 撑满剩余空间，独立滚动 -->
      <main
        ref="messageContainer"
        class="flex-1 overflow-y-auto px-6 py-5"
      >
        <!-- 报告生成中 -->
        <div v-if="isGeneratingReport" class="flex flex-col items-center justify-center h-full gap-4">
          <div class="text-5xl animate-spin-slow">🔮</div>
          <p class="text-gray-400 text-base">正在生成你的 MBTI 报告...</p>
        </div>

        <template v-else>
          <ChatBubble
            v-for="(msg, idx) in messages"
            :key="idx"
            :message="msg"
            :isStreaming="idx === messages.length - 1 && msg.role === 'assistant' && loading"
          />

          <TypingIndicator
            v-if="loading && (messages.length === 0 || messages[messages.length - 1].role !== 'assistant' || !streamingText)"
          />
        </template>
      </main>

      <!-- 底部输入栏：shrink-0 贴底 -->
      <footer class="shrink-0 border-t border-gray-100 px-5 py-4">
        <div v-if="error" class="text-red-400 text-sm mb-3 px-1">{{ error }}</div>

        <div class="flex items-end gap-3">
          <textarea
            ref="inputRef"
            v-model="inputText"
            :disabled="loading || isFinished"
            @keydown="handleKeydown"
            rows="1"
            :placeholder="loading ? '对方正在输入...' : '输入你的回复...'"
            class="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base leading-relaxed max-h-28 overflow-y-auto focus:outline-none focus:border-gray-400 focus:bg-white disabled:opacity-40 transition-all"
          />
          <button
            @click="handleSend"
            :disabled="loading || isFinished || !inputText.trim()"
            class="shrink-0 w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center text-base cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            ↵
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChat } from '../composables/useChat'
import ChatBubble from '../components/ChatBubble.vue'
import TypingIndicator from '../components/TypingIndicator.vue'

const router = useRouter()
const inputText = ref('')
const inputRef = ref(null)
const messageContainer = ref(null)

const {
  messages, currentRound, maxRounds, progress,
  isFinished, isGeneratingReport, canSkip,
  loading, streamingText, error,
  initChat, sendMessage, getGreeting, isEndCommand, generateReport, report,
} = useChat()

function scrollToBottom() {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

watch([messages, streamingText], scrollToBottom, { deep: true })

watch(isFinished, (val) => {
  if (!val) return
  const unwatch = watch(isGeneratingReport, (generating) => {
    if (!generating && report.value) {
      sessionStorage.setItem('mbti_report', JSON.stringify(report.value))
      sessionStorage.setItem('mbti_messages', JSON.stringify(messages.value))
      unwatch()
      router.push('/report')
    }
  }, { immediate: true })
})

function onChunk(chunk) {
  const last = messages.value[messages.value.length - 1]
  if (last && last.role === 'assistant') {
    last.content = chunk
  } else {
    messages.value.push({ role: 'assistant', content: chunk })
  }
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || loading.value || isFinished.value) return
  inputText.value = ''

  if (isEndCommand(text)) {
    messages.value.push({ role: 'user', content: text })
    await generateReport()
    return
  }

  await sendMessage(text, onChunk)
}

async function handleSkipToReport() {
  await generateReport()
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

watch(inputText, () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = inputRef.value.scrollHeight + 'px'
    }
  })
})

onMounted(async () => {
  const tagsStr = sessionStorage.getItem('mbti_tags')
  if (!tagsStr) { router.replace('/tags'); return }
  const tags = JSON.parse(tagsStr)
  initChat(tags)
  await getGreeting(onChunk)
})
</script>

<style>
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow { animation: spin-slow 2s linear infinite; }
</style>
