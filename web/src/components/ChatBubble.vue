<template>
  <div
    class="flex mb-4 animate-fade-in"
    :class="isUser ? 'justify-end' : 'justify-start'"
  >
    <!-- AI 头像 -->
    <div v-if="!isUser" class="flex-shrink-0 w-8 h-8 rounded-full bg-[#F0EEFF] flex items-center justify-center text-base mr-2 mt-1">
      🔮
    </div>

    <!-- 气泡 -->
    <div
      class="max-w-[75%] px-4 py-3 rounded-2xl whitespace-pre-wrap break-words text-[15px] leading-relaxed"
      :class="isUser
        ? 'bg-[#6C5CE7] text-white rounded-br-sm'
        : 'bg-[#F0EEFF] text-gray-800 rounded-bl-sm'"
    >
      {{ message.content }}
      <span
        v-if="isStreaming && !isUser"
        class="inline-block w-1 h-4 ml-0.5 bg-gray-400 align-middle animate-blink"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  isStreaming: {
    type: Boolean,
    default: false,
  },
})

const isUser = computed(() => props.message.role === 'user')
</script>

<style>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-fade-in { animation: fade-in 0.3s ease-out both; }
.animate-blink { animation: blink 0.8s step-end infinite; }
</style>
