<template>
  <div class="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20">
    <!-- 加载状态 -->
    <div v-if="!report" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="text-4xl mb-4 animate-bounce">🔮</div>
        <p class="text-gray-500">加载报告中...</p>
      </div>
    </div>

    <div v-else class="max-w-lg mx-auto px-4 pt-8">
      <!-- 顶部：MBTI 类型 -->
      <div class="text-center mb-8 animate-fade-in-up">
        <div class="text-6xl font-black tracking-wider mb-3">
          <span :class="letterColor(0)">{{ report.type?.[0] }}</span>
          <span :class="letterColor(1)">{{ report.type?.[1] }}</span>
          <span :class="letterColor(2)">{{ report.type?.[2] }}</span>
          <span :class="letterColor(3)">{{ report.type?.[3] }}</span>
        </div>
        <p class="text-lg text-gray-600">{{ report.headline }}</p>
        <div class="w-16 h-1 bg-purple-400 mx-auto mt-4 rounded-full"></div>
      </div>

      <!-- 四维度 -->
      <ReportCard title="四维度解析" icon="📊" :delay="100">
        <div class="space-y-6">
          <DimensionBar
            v-for="(dim, key) in dimensionList"
            :key="key"
            :left-label="dim.left"
            :right-label="dim.right"
            :left-value="dim.leftVal"
            :right-value="dim.rightVal"
            :dominant="dim.dominant"
            :analysis="dim.analysis"
          />
        </div>
      </ReportCard>

      <!-- 认知功能栈 -->
      <ReportCard title="认知功能栈" icon="🧬" :delay="200">
        <div class="space-y-3">
          <div
            v-for="(fn, idx) in cognitiveList"
            :key="idx"
            class="flex items-center gap-3 p-3 rounded-xl"
            :class="cognitiveColors[idx]"
          >
            <div class="text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center bg-white/60">
              {{ idx + 1 }}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm">{{ fn.code }}</span>
                <span class="text-xs text-gray-600">{{ fn.name }}</span>
                <span class="text-xs text-gray-400 ml-auto">{{ cognitiveLabels[idx] }}</span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">{{ fn.description }}</p>
            </div>
          </div>
        </div>
      </ReportCard>

      <!-- 超能力 -->
      <ReportCard title="你的超能力" icon="💪" :delay="300">
        <ul class="space-y-2">
          <li v-for="(s, i) in report.strengths" :key="i" class="flex items-start gap-2">
            <span class="text-green-500 mt-0.5 shrink-0">✦</span>
            <span class="text-sm text-gray-700">{{ s }}</span>
          </li>
        </ul>
      </ReportCard>

      <!-- 成长空间 -->
      <ReportCard title="成长空间" icon="🌱" :delay="400">
        <ul class="space-y-2">
          <li v-for="(g, i) in report.growthAreas" :key="i" class="flex items-start gap-2">
            <span class="text-orange-400 mt-0.5 shrink-0">◆</span>
            <span class="text-sm text-gray-700">{{ g }}</span>
          </li>
        </ul>
      </ReportCard>

      <!-- 边界维度提醒 -->
      <div
        v-if="report.borderlineDimensions?.length"
        class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 animate-fade-in-up"
      >
        <div class="flex items-center gap-2 mb-2">
          <span>⚠️</span>
          <span class="font-semibold text-amber-700 text-sm">边界维度提醒</span>
        </div>
        <ul class="space-y-1">
          <li v-for="(b, i) in report.borderlineDimensions" :key="i" class="text-xs text-amber-600">
            {{ b }}
          </li>
        </ul>
      </div>

      <!-- 总结 -->
      <ReportCard title="总结" icon="💡" :delay="500">
        <p class="text-sm text-gray-600 leading-relaxed">{{ report.summary }}</p>
        <p class="text-xs text-gray-400 mt-3 italic">MBTI 是认识自己的一面镜子，不是一个盒子。</p>
      </ReportCard>

      <!-- 操作按钮 -->
      <div class="flex flex-col gap-3 mt-6 mb-8">
        <button
          @click="shareResult"
          class="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
        >
          {{ shareText }}
        </button>
        <button
          @click="retest"
          class="w-full py-3 bg-white border border-purple-200 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
        >
          重新测试
        </button>
        <button
          @click="showHistory = !showHistory"
          class="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          {{ showHistory ? '收起对话记录' : '查看对话记录' }}
        </button>
      </div>

      <!-- 对话记录折叠 -->
      <div v-if="showHistory" class="mb-12 bg-white rounded-2xl p-4 shadow-sm">
        <div
          v-for="(msg, i) in chatMessages"
          :key="i"
          class="mb-3 text-sm"
          :class="msg.role === 'user' ? 'text-right' : 'text-left'"
        >
          <span
            class="inline-block px-3 py-2 rounded-2xl max-w-[80%]"
            :class="msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'"
          >
            {{ msg.content }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DimensionBar from '../components/DimensionBar.vue'
import ReportCard from '../components/ReportCard.vue'

const router = useRouter()
const report = ref(null)
const chatMessages = ref([])
const showHistory = ref(false)
const shareText = ref('分享结果')

const letterColors = [
  'text-purple-600', 'text-indigo-500', 'text-violet-500', 'text-fuchsia-500'
]
function letterColor(i) { return letterColors[i] || 'text-purple-600' }

const dimensionList = computed(() => {
  if (!report.value?.dimensions) return []
  const d = report.value.dimensions
  return [
    { left: 'E', right: 'I', leftVal: d.EI.E, rightVal: d.EI.I, dominant: d.EI.dominant, analysis: d.EI.analysis },
    { left: 'S', right: 'N', leftVal: d.SN.S, rightVal: d.SN.N, dominant: d.SN.dominant, analysis: d.SN.analysis },
    { left: 'T', right: 'F', leftVal: d.TF.T, rightVal: d.TF.F, dominant: d.TF.dominant, analysis: d.TF.analysis },
    { left: 'J', right: 'P', leftVal: d.JP.J, rightVal: d.JP.P, dominant: d.JP.dominant, analysis: d.JP.analysis },
  ]
})

const cognitiveLabels = ['主导功能', '辅助功能', '第三功能', '劣势功能']
const cognitiveColors = [
  'bg-purple-100', 'bg-indigo-50', 'bg-violet-50', 'bg-gray-50'
]
const cognitiveList = computed(() => {
  const s = report.value?.cognitiveStack
  if (!s) return []
  return [s.dominant, s.auxiliary, s.tertiary, s.inferior]
})

function shareResult() {
  const text = `我的 MBTI 是 ${report.value.type} — ${report.value.headline}\n快来测测你的：${window.location.href}`
  navigator.clipboard.writeText(text).then(() => {
    shareText.value = '已复制!'
    setTimeout(() => { shareText.value = '分享结果' }, 2000)
  }).catch(() => {
    shareText.value = '复制失败'
    setTimeout(() => { shareText.value = '分享结果' }, 2000)
  })
}

function retest() {
  sessionStorage.removeItem('mbti_report')
  sessionStorage.removeItem('mbti_messages')
  router.push('/tags')
}

onMounted(() => {
  try {
    const raw = sessionStorage.getItem('mbti_report')
    if (raw) report.value = JSON.parse(raw)
    const msgs = sessionStorage.getItem('mbti_messages')
    if (msgs) chatMessages.value = JSON.parse(msgs)
  } catch (e) {
    console.error('解析报告失败:', e)
  }
  if (!report.value) {
    router.push('/')
  }
})
</script>
