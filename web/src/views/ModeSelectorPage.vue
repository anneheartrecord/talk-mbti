<template>
  <div
    style="
      min-height: 100vh;
      background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 50%, #6C5CE7 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    "
  >
    <!-- 标题 -->
    <div style="text-align: center; margin-bottom: 36px;">
      <h1 style="font-size: 28px; font-weight: 800; color: #fff; margin: 0 0 8px;">
        选择测试模式
      </h1>
      <p style="font-size: 15px; color: rgba(255, 255, 255, 0.7); margin: 0;">
        选一个适合你的方式开始探索
      </p>
    </div>

    <!-- 模式卡片列表 -->
    <div style="width: 100%; max-width: 460px; display: flex; flex-direction: column; gap: 20px;">
      <!-- 标准版 -->
      <div
        @click="goTo('/tags')"
        style="
          background: #fff;
          border-radius: 20px;
          padding: 28px 24px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
        "
        @mouseenter="hoverCard($event, true)"
        @mouseleave="hoverCard($event, false)"
      >
        <div style="display: flex; align-items: flex-start; gap: 16px;">
          <span style="font-size: 44px; line-height: 1;">🔮</span>
          <div style="flex: 1;">
            <h2 style="font-size: 20px; font-weight: 700; color: #2d3436; margin: 0 0 6px;">
              MBTI 人格测试
            </h2>
            <p style="font-size: 14px; color: #636e72; margin: 0 0 12px; line-height: 1.5;">
              通过自然对话分析你的人格类型
            </p>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span
                style="
                  display: inline-block;
                  padding: 4px 10px;
                  border-radius: 20px;
                  background: #e8f5e9;
                  color: #2e7d32;
                  font-size: 12px;
                  font-weight: 600;
                "
              >免费</span>
              <span style="font-size: 12px; color: #b2bec3;">· 约5分钟</span>
            </div>
          </div>
          <span style="color: #b2bec3; font-size: 20px; align-self: center;">›</span>
        </div>
      </div>

      <!-- 学生版 -->
      <div
        @click="goTo('/tags?mode=student')"
        style="
          background: #fff;
          border-radius: 20px;
          padding: 28px 24px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
        "
        @mouseenter="hoverCard($event, true)"
        @mouseleave="hoverCard($event, false)"
      >
        <div style="display: flex; align-items: flex-start; gap: 16px;">
          <span style="font-size: 44px; line-height: 1;">🎓</span>
          <div style="flex: 1;">
            <h2 style="font-size: 20px; font-weight: 700; color: #2d3436; margin: 0 0 6px;">
              学生专业推荐
            </h2>
            <p style="font-size: 14px; color: #636e72; margin: 0 0 12px; line-height: 1.5;">
              分析人格类型 + 推荐匹配专业
            </p>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span
                style="
                  display: inline-block;
                  padding: 4px 10px;
                  border-radius: 20px;
                  background: #e8f5e9;
                  color: #2e7d32;
                  font-size: 12px;
                  font-weight: 600;
                "
              >免费</span>
              <span style="font-size: 12px; color: #b2bec3;">· 约8分钟</span>
            </div>
          </div>
          <span style="color: #b2bec3; font-size: 20px; align-self: center;">›</span>
        </div>
      </div>

      <!-- 玄学版 -->
      <div
        @click="goTo('/birth-info')"
        style="
          background: #fff;
          border-radius: 20px;
          padding: 28px 24px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
        "
        @mouseenter="hoverCard($event, true)"
        @mouseleave="hoverCard($event, false)"
      >
        <!-- 付费角标 -->
        <div
          style="
            position: absolute;
            top: 16px;
            right: 16px;
            padding: 4px 12px;
            border-radius: 20px;
            background: linear-gradient(135deg, #6C5CE7, #a29bfe);
            color: #fff;
            font-size: 12px;
            font-weight: 700;
          "
        >¥9.9</div>
        <div style="display: flex; align-items: flex-start; gap: 16px;">
          <span style="font-size: 44px; line-height: 1;">🌙</span>
          <div style="flex: 1;">
            <h2 style="font-size: 20px; font-weight: 700; color: #2d3436; margin: 0 0 6px;">
              八字 × MBTI 命理
            </h2>
            <p style="font-size: 14px; color: #636e72; margin: 0 0 12px; line-height: 1.5;">
              结合出生八字和人格分析的综合报告
            </p>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span
                style="
                  display: inline-block;
                  padding: 4px 10px;
                  border-radius: 20px;
                  background: #f3f0ff;
                  color: #6C5CE7;
                  font-size: 12px;
                  font-weight: 600;
                "
              >¥9.9</span>
              <span style="font-size: 12px; color: #b2bec3;">· 约10分钟</span>
            </div>
          </div>
          <span style="color: #b2bec3; font-size: 20px; align-self: center;">›</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goTo(path) {
  router.push(path)
}

function hoverCard(event, entering) {
  const el = event.currentTarget
  if (entering) {
    el.style.transform = 'scale(1.02)'
    el.style.boxShadow = '0 8px 32px rgba(108, 92, 231, 0.2)'
  } else {
    el.style.transform = 'scale(1)'
    el.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
  }
}
</script>
