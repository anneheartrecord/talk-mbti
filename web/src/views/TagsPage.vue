<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-xl min-h-[90vh] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
      <!-- 顶部跳过 -->
      <div class="px-8 pt-7 pb-3 flex justify-end shrink-0">
        <button
          @click="skipAll"
          class="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          跳过全部 →
        </button>
      </div>

      <!-- 主内容区 -->
      <div class="flex-1 flex flex-col items-center justify-center px-16">
        <transition name="slide" mode="out-in">
          <!-- 标签分类步骤 -->
          <div v-if="currentStep < TAG_CATEGORIES.length" :key="currentStep" class="w-full">
            <div class="text-center mb-14">
              <div class="text-7xl mb-8">{{ currentCategory.icon }}</div>
              <h2 class="text-2xl font-bold text-gray-900 mb-6">
                {{ currentCategory.label }}
                <span class="text-sm font-normal text-gray-400 ml-2">
                  （{{ currentCategory.type === 'multi' ? '多选' : '单选' }}）
                </span>
              </h2>
              <p class="text-gray-400 text-base">
                {{ currentCategory.type === 'multi' ? `最多选 ${currentCategory.maxSelect} 个` : '选你最符合的' }}
              </p>
            </div>

            <!-- 标签按钮 -->
            <div
              class="grid gap-5 mb-14"
              :class="currentCategory.options.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'"
            >
              <button
                v-for="option in currentCategory.options"
                :key="option"
                @click="toggleOption(option)"
                class="px-5 py-5 rounded-xl text-base font-medium border-2 transition-all duration-150 cursor-pointer select-none"
                :class="isSelected(option)
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <!-- 自定义标签步骤 -->
          <div v-else-if="currentStep === TAG_CATEGORIES.length" :key="'custom'" class="w-full text-center">
            <div class="text-7xl mb-8">✏️</div>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">还有什么想说的？</h2>
            <p class="text-gray-400 text-base mb-14">随便补充一句，让 AI 更了解你（可跳过）</p>

            <input
              v-model="customTag"
              type="text"
              placeholder="比如「猫奴」「社恐晚期」「咖啡续命」"
              class="w-full px-6 py-5 rounded-xl border-2 border-gray-200 text-lg text-gray-700 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors text-center mb-14"
              @keyup.enter="handleStart"
            />
          </div>
        </transition>
      </div>

      <!-- 底部进度 -->
      <div class="px-8 py-5 flex items-center justify-between border-t border-gray-100 shrink-0">
        <button
          @click="prev"
          :disabled="currentStep === 0"
          class="px-5 py-3 bg-white text-gray-600 rounded-full hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          :class="currentStep > 0 ? 'cursor-pointer' : 'cursor-default'"
        >
          ‹ 上一步
        </button>

        <div class="flex items-center gap-3">
          <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-gray-800 rounded-full transition-all duration-500"
              :style="{ width: ((currentStep + 1) / allSteps.length * 100) + '%' }"
            ></div>
          </div>
          <span class="text-xs text-gray-400 tabular-nums shrink-0">{{ currentStep + 1 }}/{{ allSteps.length }}</span>
        </div>

        <button
          @click="nextOrStart"
          class="px-5 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 active:scale-95 transition-all cursor-pointer shadow-md"
        >
          {{ currentStep < TAG_CATEGORIES.length ? (hasSelection ? '下一步' : '跳过此项') : '开始对话 🔮' }}
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