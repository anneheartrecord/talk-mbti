<template>
  <div
    class="flex items-start gap-3 py-4"
    :class="isUser ? 'flex-row-reverse' : ''"
  >
    <!-- 头像 -->
    <div
      class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
      :class="isUser ? 'bg-blue-100' : 'bg-purple-100'"
    >
      {{ isUser ? '🧑' : '🔮' }}
    </div>

    <!-- 消息气泡 -->
    <div
      class="max-w-[78%] px-4 py-3.5 rounded-2xl text-base leading-relaxed whitespace-pre-wrap break-words"
      :class="isUser
        ? 'bg-blue-50 text-gray-800 rounded-tr-sm'
        : 'bg-gray-50 text-gray-800 rounded-tl-sm'"
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
