<template>
  <div class="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white flex flex-col items-center justify-center px-5">
    <!-- 进度指示器 -->
    <div class="fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
      <div
        v-for="(cat, i) in allSteps"
        :key="i"
        class="h-2 rounded-full transition-all duration-500"
        :class="i === currentStep ? 'w-10 bg-purple-500' : i < currentStep ? 'w-5 bg-purple-300' : 'w-5 bg-gray-200'"
      ></div>
    </div>

    <!-- 一键跳过 -->
    <button
      @click="skipAll"
      class="fixed top-8 right-5 text-sm text-gray-300 hover:text-purple-400 transition-colors cursor-pointer z-10"
    >
      全部跳过 →
    </button>

    <!-- 卡片容器 -->
    <div class="w-full max-w-lg">
      <transition name="slide" mode="out-in">
        <!-- 标签分类步骤 -->
        <div v-if="currentStep < TAG_CATEGORIES.length" :key="currentStep" class="text-center">
          <div class="text-6xl mb-5">{{ currentCategory.icon }}</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ currentCategory.label }}</h2>
          <p class="text-sm text-gray-400 mb-10">
            {{ currentCategory.type === 'multi' ? `最多选 ${currentCategory.maxSelect} 个，选好点下一步` : '选一个最像你的' }}
          </p>

          <!-- 标签按钮区：加大间距和尺寸 -->
          <div class="flex flex-wrap justify-center gap-4 mb-12 px-2">
            <button
              v-for="option in currentCategory.options"
              :key="option"
              @click="toggleOption(option)"
              class="px-6 py-3 rounded-2xl text-base font-semibold border-2 transition-all duration-200 cursor-pointer select-none"
              :class="isSelected(option)
                ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200 scale-105'
                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-500 hover:shadow-md active:scale-95'"
            >
              {{ option }}
            </button>
          </div>

          <!-- 导航按钮 -->
          <div class="flex items-center justify-center gap-6">
            <button
              v-if="currentStep > 0"
              @click="prev"
              class="px-5 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              ← 上一步
            </button>
            <button
              @click="next"
              class="px-10 py-3 bg-purple-600 text-white text-sm font-bold rounded-full hover:bg-purple-700 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {{ hasSelection ? '下一步 →' : '跳过 →' }}
            </button>
          </div>
        </div>

        <!-- 自定义标签步骤 -->
        <div v-else-if="currentStep === TAG_CATEGORIES.length" :key="'custom'" class="text-center">
          <div class="text-6xl mb-5">✏️</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">还有什么想说的？</h2>
          <p class="text-sm text-gray-400 mb-10">随便补充一句，让 AI 更了解你（可跳过）</p>

          <input
            v-model="customTag"
            type="text"
            placeholder="比如「猫奴」「社恐晚期」「咖啡续命」"
            class="w-full max-w-sm mx-auto px-6 py-4 rounded-2xl border-2 border-gray-200 text-base text-center text-gray-700 placeholder-gray-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all"
            @keyup.enter="handleStart"
          />

          <div class="flex items-center justify-center gap-6 mt-12">
            <button
              @click="prev"
              class="px-5 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              ← 上一步
            </button>
            <button
              @click="handleStart"
              class="px-12 py-3.5 bg-purple-600 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              开始对话 🔮
            </button>
          </div>
        </div>
      </transition>

      <!-- 底部已选标签预览 -->
      <div class="mt-14 text-center min-h-[48px]">
        <transition-group name="tag-pop" tag="div" class="flex flex-wrap justify-center gap-2.5">
          <span
            v-for="tag in selectedSummary"
            :key="tag"
            class="px-4 py-1.5 bg-purple-50 text-purple-500 text-xs font-medium rounded-full border border-purple-100"
          >
            {{ tag }}
          </span>
        </transition-group>
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

// 初始化选中值
const selections = reactive({})
TAG_CATEGORIES.forEach((cat) => {
  selections[cat.id] = cat.type === 'multi' ? [] : ''
})

// 所有步骤 = 分类 + 自定义
const allSteps = computed(() => [...TAG_CATEGORIES, { id: 'custom' }])

// 当前分类
const currentCategory = computed(() => TAG_CATEGORIES[currentStep.value])

// 当前步骤是否已有选择
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
  if (currentStep.value < TAG_CATEGORIES.length) {
    currentStep.value++
  }
}

function prev() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function skipAll() {
  sessionStorage.setItem('mbti_tags', JSON.stringify({}))
  router.push('/chat')
}

// 已选标签汇总（底部预览）
const selectedSummary = computed(() => {
  const tags = []
  TAG_CATEGORIES.forEach((cat) => {
    const val = selections[cat.id]
    if (cat.type === 'multi' && val.length > 0) {
      tags.push(...val)
    } else if (cat.type === 'single' && val) {
      tags.push(val)
    }
  })
  return tags
})

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
  if (customTag.value.trim()) {
    result.custom = customTag.value.trim()
  }
  sessionStorage.setItem('mbti_tags', JSON.stringify(result))
  router.push('/chat')
}
</script>

<style>
.slide-enter-active, .slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

.tag-pop-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.tag-pop-leave-active {
  transition: all 0.2s ease-in;
}
.tag-pop-enter-from {
  opacity: 0;
  transform: scale(0.6);
}
.tag-pop-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
