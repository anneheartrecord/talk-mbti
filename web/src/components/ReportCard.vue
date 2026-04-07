<template>
  <div
    ref="cardRef"
    class="bg-white rounded-2xl p-10 shadow-md mb-10 transition-all duration-500"
    :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
    :style="{ transitionDelay: delay + 'ms' }"
  >
    <div class="flex items-center gap-3 mb-6">
      <span class="text-2xl">{{ icon }}</span>
      <h3 class="font-bold text-gray-800 text-xl">{{ title }}</h3>
    </div>
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  title: String,
  icon: String,
  delay: { type: Number, default: 0 },
})

const cardRef = ref(null)
const visible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.1 }
  )
  if (cardRef.value) observer.observe(cardRef.value)
})
</script>
