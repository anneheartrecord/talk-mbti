<template>
  <div class="flex items-start gap-4 py-3">
    <!-- AI 头像 -->
    <div class="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg">
      🔮
    </div>

    <!-- 打字指示器 -->
    <div class="flex items-center gap-1.5 pt-2.5">
      <span class="w-2 h-2 bg-gray-300 rounded-full animate-typing-dot-1" />
      <span class="w-2 h-2 bg-gray-300 rounded-full animate-typing-dot-2" />
      <span class="w-2 h-2 bg-gray-300 rounded-full animate-typing-dot-3" />
    </div>
  </div>
</template>

<script setup>
</script>

<style>
@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
  30% { transform: translateY(-5px); opacity: 1; }
}
.animate-typing-dot-1 { animation: typing-bounce 1.2s ease-in-out infinite; }
.animate-typing-dot-2 { animation: typing-bounce 1.2s ease-in-out 0.2s infinite; }
.animate-typing-dot-3 { animation: typing-bounce 1.2s ease-in-out 0.4s infinite; }
</style>
