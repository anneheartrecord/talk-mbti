import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 只在有配置时创建客户端（本地开发无 key 时不报错）
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null

/**
 * 获取或创建匿名用户 ID
 * 存在 localStorage 中，同一浏览器视为同一用户
 */
export function getUserId() {
  let userId = localStorage.getItem('mbti_user_id')
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem('mbti_user_id', userId)
  }
  return userId
}

/**
 * 保存 MBTI 测试结果 + 对话记录
 * @param {Object} report - MBTI 报告对象
 * @param {Array} messages - 对话记录 [{role, content}]
 * @param {Object} userTags - 用户选择的标签
 * @param {number} roundCount - 对话轮次
 */
export async function saveResult(report, messages, userTags, roundCount) {
  if (!supabase) {
    console.warn('[Supabase] 未配置，跳过数据保存')
    return null
  }

  const userId = getUserId()

  try {
    // 1. 保存报告
    const { data: resultData, error: resultError } = await supabase
      .from('mbti_results')
      .insert({
        user_id: userId,
        mbti_type: report.type,
        headline: report.headline,
        dimensions: report.dimensions,
        cognitive_stack: report.cognitiveStack,
        strengths: report.strengths,
        growth_areas: report.growthAreas,
        summary: report.summary,
        user_tags: userTags,
      })
      .select('id')
      .single()

    if (resultError) {
      console.error('[Supabase] 保存报告失败:', resultError)
      return null
    }

    // 2. 保存对话记录
    const { error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        result_id: resultData.id,
        messages,
        round_count: roundCount,
      })

    if (convError) {
      console.error('[Supabase] 保存对话失败:', convError)
    }

    return resultData.id
  } catch (e) {
    console.error('[Supabase] 保存异常:', e)
    return null
  }
}

/**
 * 获取统计数据
 */
export async function getStats() {
  if (!supabase) return null

  try {
    const [totalRes, distRes] = await Promise.all([
      supabase.rpc('get_total_count'),
      supabase.rpc('get_mbti_distribution'),
    ])

    return {
      total: totalRes.data || 0,
      distribution: distRes.data || [],
    }
  } catch (e) {
    console.error('[Supabase] 获取统计失败:', e)
    return null
  }
}
