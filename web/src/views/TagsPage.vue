<template>
  <!-- 全屏背景 + 居中容器 -->
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <!-- 主容器卡片 -->
    <div class="w-full max-w-xl min-h-[90vh] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
      <!-- 顶部跳过 -->
      <div class="px-8 pt-6 pb-2 flex justify-end shrink-0">
        <button
          @click="skipAll"
          class="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          跳过全部 →
        </button>
      </div>

      <!-- 主内容区：垂直水平居中 -->
      <div class="flex-1 flex flex-col items-center justify-center px-8">
        <transition name="slide" mode="out-in">
          <!-- 标签分类步骤 -->
          <div v-if="currentStep < TAG_CATEGORIES.length" :key="currentStep" class="w-full max-w-md">
            <div class="text-center mb-8">
              <div class="text-5xl mb-4">{{ currentCategory.icon }}</div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                {{ currentCategory.label }}
                <span class="text-base font-normal text-gray-400">
                  （{{ currentCategory.type === 'multi' ? '多选' : '单选' }}）
                </span>
              </h2>
              <p class="text-gray-400 text-sm mt-2 mb-2">
                {{ currentCategory.type === 'multi' ? `最多选 ${currentCategory.maxSelect} 个` : '选一个最像你的' }}
              </p>
            </div>

            <!-- 标签按钮：grid 布局，充分间距 -->
            <div
              class="grid gap-4"
              :class="currentCategory.options.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'"
            >
              <button
                v-for="option in currentCategory.options"
                :key="option"
                @click="toggleOption(option)"
                class="px-5 py-4 rounded-xl text-base font-medium border-2 transition-all duration-150 cursor-pointer select-none"
                :class="isSelected(option)
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <!-- 自定义标签步骤 -->
          <div v-else-if="currentStep === TAG_CATEGORIES.length" :key="'custom'" class="w-full max-w-md text-center">
            <div class="text-5xl mb-4">✏️</div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">还有什么想说的？</h2>
            <p class="text-gray-400 text-sm mb-8">随便补充一句，让 AI 更了解你（可跳过）</p>

            <input
              v-model="customTag"
              type="text"
              placeholder="比如「猫奴」「社恐晚期」「咖啡续命」"
              class="w-full px-5 py-4 rounded-xl border-2 border-gray-200 text-base text-gray-700 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors text-center"
              @keyup.enter="handleStart"
            />
          </div>
        </transition>
      </div>

      <!-- 底部导航栏 -->
      <div class="px-8 py-5 flex items-center justify-between border-t border-gray-100 shrink-0">
        <button
          @click="prev"
          :disabled="currentStep === 0"
          class="text-lg transition-colors w-16 text-left"
          :class="currentStep > 0 ? 'text-gray-500 hover:text-gray-900 cursor-pointer' : 'text-gray-200 cursor-default'"
        >
          ←
        </button>

        <span class="text-gray-400 text-sm tabular-nums">{{ currentStep + 1 }} / {{ allSteps.length }}</span>

        <button
          @click="nextOrStart"
          class="text-lg w-16 text-right text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          {{ currentStep === TAG_CATEGORIES.length ? '开始 →' : '→' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { TAG_CATEGORIES } from '../constants/tags'

const router = useRouter()
const currentStep = ref(0)
const customTag = ref('')

const selections = reactive({})
TAG_CATEGORIES.forEach((cat) => {
  selections[cat.id] = cat.type === 'multi' ? [] : ''
})

const allSteps = computed(() => [...TAG_CATEGORIES, { id: 'custom' }])
const currentCategory = computed(() => TAG_CATEGORIES[currentStep.value])

const hasSelection = computed(() => {
  if (currentStep.value >= TAG_CATEGORIES.length) return !!customTag.value.trim()
  const cat = currentCategory.value
  const val = selections[cat.id]
  return cat.type === 'multi' ? val.length > 0 : !!val
})

function isSelected(option) {
  const cat = currentCategory.value
  if (cat.type === 'multi') return selections[cat.id].includes(option)
  return selections[cat.id] === option
}

function toggleOption(option) {
  const cat = currentCategory.value
  if (cat.type === 'single') {
    selections[cat.id] = selections[cat.id] === option ? '' : option
  } else {
    const arr = selections[cat.id]
    const idx = arr.indexOf(option)
    if (idx >= 0) {
      arr.splice(idx, 1)
    } else if (arr.length < (cat.maxSelect || Infinity)) {
      arr.push(option)
    }
  }
}

function next() {
  if (currentStep.value < TAG_CATEGORIES.length) currentStep.value++
}

function prev() {
  if (currentStep.value > 0) currentStep.value--
}

function skipAll() {
  sessionStorage.setItem('mbti_tags', JSON.stringify({}))
  router.push('/chat')
}

function handleStart() {
  const result = {}
  TAG_CATEGORIES.forEach((cat) => {
    const val = selections[cat.id]
    if (cat.type === 'multi' && Array.isArray(val) && val.length > 0) {
      result[cat.id] = [...val]
    } else if (cat.type === 'single' && val) {
      result[cat.id] = val
    }
  })
  if (customTag.value.trim()) result.custom = customTag.value.trim()
  sessionStorage.setItem('mbti_tags', JSON.stringify(result))
  router.push('/chat')
}

function nextOrStart() {
  if (currentStep.value === TAG_CATEGORIES.length) handleStart()
  else next()
}
</script>

<style>
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from { opacity: 0; transform: translateX(30px); }
.slide-leave-to { opacity: 0; transform: translateX(-30px); }
</style>
