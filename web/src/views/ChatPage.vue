<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-xl h-[92vh] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">

      <!-- 顶部栏 -->
      <header class="shrink-0 px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <button
          @click="$router.back()"
          class="px-4 py-2 text-gray-400 hover:text-gray-700 text-sm cursor-pointer transition-colors rounded-lg hover:bg-gray-50"
        >
          ← 返回
        </button>

        <!-- 出报告按钮 -->
        <button
          v-if="canSkip && !isFinished && !loading"
          @click="handleSkipToReport"
          class="px-6 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-full hover:bg-purple-700 active:scale-95 transition-all cursor-pointer shadow-md animate-fade-in"
        >
          结束对话，生成报告 →
        </button>
        <span v-else></span>
      </header>

      <!-- 进度条 -->
      <div class="h-1 bg-gray-50 shrink-0">
        <div
          class="h-full bg-purple-500 transition-all duration-700 ease-out rounded-r-full"
          :style="{ width: progress + '%' }"
        ></div>
      </div>

      <!-- 消息区域 -->
      <main
        ref="messageContainer"
        class="flex-1 overflow-y-auto px-6 py-6"
      >
        <div v-if="isGeneratingReport" class="flex flex-col items-center justify-center h-full gap-6">
          <div class="text-6xl animate-spin-slow">🔮</div>
          <p class="text-gray-400 text-lg">正在生成你的 MBTI 报告...</p>
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

      <!-- 底部输入栏 -->
      <footer class="shrink-0 border-t border-gray-100 px-6 py-5">
        <div v-if="error" class="text-red-400 text-sm mb-3 px-1">{{ error }}</div>

        <div class="flex items-end gap-4">
          <textarea
            ref="inputRef"
            v-model="inputText"
            :disabled="loading || isFinished"
            @keydown="handleKeydown"
            rows="3"
            :placeholder="loading ? '对方正在输入...' : '输入你的回复...'"
            class="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-base leading-relaxed max-h-40 overflow-y-auto focus:outline-none focus:border-purple-300 focus:bg-white focus:ring-2 focus:ring-purple-50 disabled:opacity-40 transition-all"
          />
          <button
            @click="handleSend"
            :disabled="loading || isFinished || !inputText.trim()"
            class="shrink-0 w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center text-lg cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 transition-all mb-1"
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

function focusInput() {
  nextTick(() => {
    if (inputRef.value && !loading.value && !isFinished.value) {
      inputRef.value.focus()
    }
  })
}

watch([messages, streamingText], scrollToBottom, { deep: true })
watch(loading, (val) => { if (!val) focusInput() })

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

async function handleSkipToReport() { await generateReport() }

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
}

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

@keyframes fade-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in { animation: fade-in 0.3s ease-out both; }
</style>
