<template>
  <div class="flex justify-start mb-4">
    <!-- AI 头像 -->
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-[#F0EEFF] flex items-center justify-center text-base mr-2 mt-1">
      🔮
    </div>

    <!-- 打字指示器气泡 -->
    <div class="bg-[#F0EEFF] rounded-2xl rounded-bl-sm px-5 py-3 flex items-center gap-1.5">
      <span class="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot-1" />
      <span class="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot-2" />
      <span class="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot-3" />
    </div>
  </div>
</template>

<script setup>
</script>

<style>
@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}
.animate-typing-dot-1 { animation: typing-bounce 1.2s ease-in-out infinite; }
.animate-typing-dot-2 { animation: typing-bounce 1.2s ease-in-out 0.2s infinite; }
.animate-typing-dot-3 { animation: typing-bounce 1.2s ease-in-out 0.4s infinite; }
</style>
