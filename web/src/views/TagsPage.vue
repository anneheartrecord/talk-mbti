<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- 顶部跳过 -->
    <div class="px-8 pt-6 flex justify-end">
      <button
        @click="skipAll"
        class="text-sm text-gray-400 hover:text-purple-500 transition-colors cursor-pointer"
      >
        → 跳过全部，直接开聊
      </button>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col justify-center px-8 pb-4 max-w-2xl mx-auto w-full">
      <transition name="slide" mode="out-in">
        <!-- 标签分类步骤 -->
        <div v-if="currentStep < TAG_CATEGORIES.length" :key="currentStep" class="w-full">
          <div class="text-5xl mb-4">{{ currentCategory.icon }}</div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ currentCategory.label }}
            <span class="text-lg font-normal text-gray-400 ml-2">
              （{{ currentCategory.type === 'multi' ? '多选' : '单选' }}）
            </span>
          </h2>
          <p class="text-gray-400 text-base mb-10">
            {{ currentCategory.type === 'multi' ? `最多选 ${currentCategory.maxSelect} 个` : '选一个最像你的' }}
          </p>

          <!-- 标签按钮：大按钮、网格布局 -->
          <div
            class="grid gap-4 mb-8"
            :class="currentCategory.options.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'"
          >
            <button
              v-for="option in currentCategory.options"
              :key="option"
              @click="toggleOption(option)"
              class="px-6 py-4 rounded-xl text-lg font-medium border-2 transition-all duration-200 cursor-pointer select-none text-left"
              :class="isSelected(option)
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <!-- 自定义标签步骤 -->
        <div v-else-if="currentStep === TAG_CATEGORIES.length" :key="'custom'" class="w-full">
          <div class="text-5xl mb-4">✏️</div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">还有什么想说的？</h2>
          <p class="text-gray-400 text-base mb-10">随便补充一句，让 AI 更了解你（可跳过）</p>

          <input
            v-model="customTag"
            type="text"
            placeholder="比如「猫奴」「社恐晚期」「咖啡续命」"
            class="w-full px-6 py-5 rounded-xl border-2 border-gray-200 text-lg text-gray-700 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
            @keyup.enter="handleStart"
          />
        </div>
      </transition>
    </div>

    <!-- 底部导航栏：← 页码 → -->
    <div class="px-8 py-6 flex items-center justify-between border-t border-gray-100 max-w-2xl mx-auto w-full">
      <button
        @click="prev"
        :class="currentStep > 0 ? 'text-gray-600 hover:text-gray-900 cursor-pointer' : 'text-gray-200 cursor-default'"
        class="text-xl transition-colors w-20 text-left"
        :disabled="currentStep === 0"
      >
        ←
      </button>

      <span class="text-gray-400 text-base tabular-nums">{{ currentStep + 1 }} / {{ allSteps.length }}</span>

      <button
        @click="nextOrStart"
        class="text-xl w-20 text-right transition-colors cursor-pointer text-gray-600 hover:text-gray-900"
      >
        {{ currentStep === TAG_CATEGORIES.length ? '开始 →' : '→' }}
      </button>
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

function nextOrStart() {
  if (currentStep.value === TAG_CATEGORIES.length) {
    handleStart()
  } else {
    next()
  }
}
</script>

<style>
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
