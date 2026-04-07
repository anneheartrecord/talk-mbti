<template>
  <div
    class="flex items-start gap-4 py-3"
    :class="isUser ? 'flex-row-reverse' : ''"
  >
    <!-- AI 头像 -->
    <div
      v-if="!isUser"
      class="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg"
    >
      🔮
    </div>

    <!-- 消息内容 -->
    <div
      class="max-w-[85%] text-base leading-relaxed whitespace-pre-wrap break-words"
      :class="isUser
        ? 'bg-gray-50 rounded-2xl rounded-tr-sm px-5 py-3.5 text-gray-800'
        : 'text-gray-800 pt-1'"
    >
      {{ message.content }}
      <span
        v-if="isStreaming && !isUser"
        class="inline-block w-0.5 h-5 ml-0.5 bg-gray-400 align-middle animate-blink"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: { type: Object, required: true },
  isStreaming: { type: Boolean, default: false },
})

const isUser = computed(() => props.message.role === 'user')
</script>

<style>
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink { animation: blink 0.8s step-end infinite; }
</style>
