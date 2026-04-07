<template>
  <div class="min-h-screen bg-gradient-to-br from-[#6C5CE7] via-[#a29bfe] to-[#dfe6e9] flex flex-col items-center justify-center px-8 relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
    <div class="absolute bottom-20 right-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-float-delay" />
    <div class="absolute top-1/3 right-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-float-slow" />

    <!-- 主内容 -->
    <div class="relative z-10 text-center max-w-lg animate-fade-in-up">
      <!-- 图标 -->
      <div class="mb-10 text-7xl animate-bounce-gentle">🔮</div>

      <!-- 大标题 -->
      <h1 class="text-6xl font-extrabold text-white mb-5 tracking-tight">
        读心术
      </h1>

      <!-- 副标题 -->
      <p class="text-xl text-white/80 mb-16 leading-relaxed px-4">
        不做问卷，只聊天——<br class="sm:hidden" />AI 通过对话分析你的 MBTI 人格
      </p>

      <!-- 三个特点 -->
      <div class="grid grid-cols-3 gap-6 mb-16">
        <div class="flex flex-col items-center gap-3 animate-fade-in-up-1">
          <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
            💬
          </div>
          <span class="text-white/90 text-base font-medium">自然对话</span>
        </div>
        <div class="flex flex-col items-center gap-3 animate-fade-in-up-2">
          <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
            🤖
          </div>
          <span class="text-white/90 text-base font-medium">AI 分析</span>
        </div>
        <div class="flex flex-col items-center gap-3 animate-fade-in-up-3">
          <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
            📊
          </div>
          <span class="text-white/90 text-base font-medium">即时报告</span>
        </div>
      </div>

      <!-- CTA 按钮 -->
      <button
        @click="$router.push('/tags')"
        class="px-14 py-5 bg-white text-[#6C5CE7] font-bold text-xl rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer animate-pulse-soft"
      >
        开始聊天 →
      </button>
    </div>

    <!-- 底部文字 -->
    <p class="absolute bottom-10 text-white/50 text-sm tracking-wide">
      Powered by Gemini · 约 5 分钟 · 完全免费
    </p>
  </div>
</template>

<script setup>
</script>

<style>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
@keyframes float-delay {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-30px); }
}
@keyframes float-slow {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  50% { transform: translateY(-15px) translateX(10px); }
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes pulse-soft {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
  50% { box-shadow: 0 0 0 14px rgba(255,255,255,0); }
}

.animate-float { animation: float 6s ease-in-out infinite; }
.animate-float-delay { animation: float-delay 8s ease-in-out infinite; }
.animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
.animate-fade-in-up { animation: fade-in-up 0.8s ease-out both; }
.animate-fade-in-up-1 { animation: fade-in-up 0.8s ease-out 0.2s both; }
.animate-fade-in-up-2 { animation: fade-in-up 0.8s ease-out 0.4s both; }
.animate-fade-in-up-3 { animation: fade-in-up 0.8s ease-out 0.6s both; }
.animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
.animate-pulse-soft { animation: pulse-soft 2.5s ease-in-out infinite; }
</style>
