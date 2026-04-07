<template>
  <div
    class="flex items-start"
    :class="isUser ? 'flex-row-reverse' : ''"
    style="gap: 16px; padding: 16px 0;"
  >
    <!-- 头像 -->
    <div
      class="shrink-0 rounded-full flex items-center justify-center"
      :class="isUser ? 'bg-blue-100' : 'bg-purple-100'"
      style="width: 44px; height: 44px; font-size: 20px;"
    >
      {{ isUser ? '🧑' : '🔮' }}
    </div>

    <!-- 消息气泡 -->
    <div
      class="rounded-2xl whitespace-pre-wrap break-words leading-relaxed"
      style="max-width: 78%; padding: 16px 20px; font-size: 16px;"
      :class="isUser
        ? 'bg-blue-50 text-gray-800 rounded-tr-sm'
        : 'bg-gray-50 text-gray-800 rounded-tl-sm'"
    >
      {{ message.content }}
      <span
        v-if="isStreaming && !isUser"
        class="inline-block bg-gray-400 align-middle animate-blink"
        style="width: 2px; height: 20px; margin-left: 2px;"
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
