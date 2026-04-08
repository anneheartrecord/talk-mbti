<template>
  <div class="min-h-screen bg-gradient-to-br from-[#6C5CE7] via-[#a29bfe] to-[#dfe6e9] flex flex-col items-center justify-center relative overflow-hidden" style="padding: 40px 20px;">
    <!-- 背景装饰 -->
    <div class="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
    <div class="absolute bottom-20 right-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl" />

    <div class="relative z-10 w-full" style="max-width: 420px;">
      <!-- Logo -->
      <div class="text-center" style="margin-bottom: 40px;">
        <div style="font-size: 56px; margin-bottom: 16px;">🔮</div>
        <h1 class="font-bold text-white" style="font-size: 28px;">读心术</h1>
      </div>

      <!-- 卡片 -->
      <div class="bg-white rounded-2xl shadow-xl" style="padding: clamp(24px, 5vw, 32px) clamp(20px, 4vw, 28px);">
        <!-- Tab 切换 -->
        <div class="flex rounded-xl bg-gray-100" style="padding: 4px; margin-bottom: 28px;">
          <button
            @click="activeTab = 'login'"
            class="flex-1 rounded-lg font-medium transition-all duration-200"
            :class="activeTab === 'login' ? 'bg-white text-[#6C5CE7] shadow-sm' : 'text-gray-500'"
            style="padding: 10px 0; font-size: 15px;"
          >
            登录
          </button>
          <button
            @click="activeTab = 'register'"
            class="flex-1 rounded-lg font-medium transition-all duration-200"
            :class="activeTab === 'register' ? 'bg-white text-[#6C5CE7] shadow-sm' : 'text-gray-500'"
            style="padding: 10px 0; font-size: 15px;"
          >
            注册
          </button>
        </div>

        <!-- 错误提示 -->
        <div
          v-if="auth.error.value"
          class="bg-red-50 text-red-600 rounded-xl"
          style="padding: 12px 16px; font-size: 14px; margin-bottom: 20px;"
        >
          {{ auth.error.value }}
        </div>

        <!-- 登录表单 -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin">
          <div style="margin-bottom: 20px;">
            <label class="block text-gray-600 font-medium" style="font-size: 14px; margin-bottom: 8px;">邮箱</label>
            <input
              v-model="loginForm.email"
              type="email"
              placeholder="your@email.com"
              required
              class="w-full border border-gray-200 rounded-xl outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-purple-100 transition-all"
              style="padding: clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px); font-size: 15px;"
            />
          </div>
          <div style="margin-bottom: 28px;">
            <label class="block text-gray-600 font-medium" style="font-size: 14px; margin-bottom: 8px;">密码</label>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              required
              class="w-full border border-gray-200 rounded-xl outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-purple-100 transition-all"
              style="padding: clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px); font-size: 15px;"
            />
          </div>
          <button
            type="submit"
            :disabled="auth.loading.value"
            class="w-full bg-[#6C5CE7] text-white font-bold rounded-xl hover:bg-[#5b4bd6] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style="padding: 16px 0; font-size: 16px;"
          >
            {{ auth.loading.value ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister">
          <div style="margin-bottom: 20px;">
            <label class="block text-gray-600 font-medium" style="font-size: 14px; margin-bottom: 8px;">昵称</label>
            <input
              v-model="registerForm.nickname"
              type="text"
              placeholder="你的昵称"
              class="w-full border border-gray-200 rounded-xl outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-purple-100 transition-all"
              style="padding: clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px); font-size: 15px;"
            />
          </div>
          <div style="margin-bottom: 20px;">
            <label class="block text-gray-600 font-medium" style="font-size: 14px; margin-bottom: 8px;">邮箱</label>
            <input
              v-model="registerForm.email"
              type="email"
              placeholder="your@email.com"
              required
              class="w-full border border-gray-200 rounded-xl outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-purple-100 transition-all"
              style="padding: clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px); font-size: 15px;"
            />
          </div>
          <div style="margin-bottom: 28px;">
            <label class="block text-gray-600 font-medium" style="font-size: 14px; margin-bottom: 8px;">密码</label>
            <input
              v-model="registerForm.password"
              type="password"
              placeholder="至少 6 位密码"
              required
              class="w-full border border-gray-200 rounded-xl outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-purple-100 transition-all"
              style="padding: clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px); font-size: 15px;"
            />
          </div>
          <button
            type="submit"
            :disabled="auth.loading.value"
            class="w-full bg-[#6C5CE7] text-white font-bold rounded-xl hover:bg-[#5b4bd6] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style="padding: 16px 0; font-size: 16px;"
          >
            {{ auth.loading.value ? '注册中...' : '注册' }}
          </button>
        </form>
      </div>

      <!-- 社交登录 -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.15);">
        <p style="font-size: 13px; color: rgba(255,255,255,0.5); text-align: center; margin-bottom: 16px;">或使用第三方登录</p>
        <div style="display: flex; justify-content: center; gap: 16px;">
          <button
            @click="handleOAuthLogin('google')"
            class="flex items-center justify-center rounded-xl bg-white/20 backdrop-blur hover:bg-white/30 transition-all cursor-pointer"
            style="width: 56px; height: 56px; font-size: 24px;"
            title="Google 登录"
          >📧</button>
          <button
            disabled
            class="flex items-center justify-center rounded-xl bg-white/10 transition-all"
            style="width: 56px; height: 56px; font-size: 24px; opacity: 0.4; cursor: not-allowed;"
            title="微信登录（即将支持）"
          >💬</button>
          <button
            disabled
            class="flex items-center justify-center rounded-xl bg-white/10 transition-all"
            style="width: 56px; height: 56px; font-size: 24px; opacity: 0.4; cursor: not-allowed;"
            title="QQ 登录（即将支持）"
          >🐧</button>
        </div>
      </div>

      <!-- 访客入口 -->
      <div class="text-center" style="margin-top: 28px;">
        <button
          @click="$router.push('/')"
          class="text-white/80 hover:text-white underline underline-offset-4 transition-colors"
          style="font-size: 15px;"
        >
          以访客身份继续 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthGlobal } from '../composables/useAuth'
import { supabase } from '../lib/supabase'

const router = useRouter()
const auth = useAuthGlobal()

const activeTab = ref('login')

const loginForm = reactive({
  email: '',
  password: '',
})

const registerForm = reactive({
  nickname: '',
  email: '',
  password: '',
})

function redirectAfterLogin() {
  const redirect = sessionStorage.getItem('redirect_after_login')
  if (redirect) {
    sessionStorage.removeItem('redirect_after_login')
    router.push(redirect)
  } else {
    router.push('/')
  }
}

async function handleLogin() {
  auth.error.value = null
  const success = await auth.signIn(loginForm.email, loginForm.password)
  if (success) {
    redirectAfterLogin()
  }
}

async function handleRegister() {
  auth.error.value = null
  const success = await auth.signUp(registerForm.email, registerForm.password, registerForm.nickname)
  if (success) {
    redirectAfterLogin()
  }
}

async function handleOAuthLogin(provider) {
  if (!supabase) return
  auth.error.value = null
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    })
    if (error) auth.error.value = error.message
  } catch (e) {
    auth.error.value = e.message
  }
}
</script>
