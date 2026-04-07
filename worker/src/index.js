/**
 * Gemini API 反向代理 - Cloudflare Worker
 *
 * 作用：
 * 1. 隐藏 Gemini API Key（存在 Worker 环境变量中，前端看不到）
 * 2. 解决国内用户无法直连 Google API 的问题
 * 3. Cloudflare 全球 CDN 加速
 *
 * 前端请求：POST https://your-worker.workers.dev/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse
 * Worker 转发：POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=xxx&alt=sse
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com'

export default {
  async fetch(request, env) {
    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(env),
      })
    }

    // 只允许来自我们网站的请求
    const origin = request.headers.get('Origin') || ''
    const allowedOrigins = [
      env.ALLOWED_ORIGIN,         // 生产环境
      'http://localhost:5173',     // 本地开发
      'http://localhost:5174',
      'http://localhost:4173',
    ]
    if (!allowedOrigins.some(o => origin.startsWith(o))) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 只接受 POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 构造目标 URL：把前端请求路径转发到 Google，注入 API Key
    const url = new URL(request.url)
    const targetUrl = new URL(url.pathname + url.search, GEMINI_API_BASE)
    targetUrl.searchParams.set('key', env.GEMINI_API_KEY)

    // 转发请求
    const response = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
      },
      body: request.body,
    })

    // 返回响应（保留 streaming）
    const headers = new Headers(response.headers)
    Object.entries(corsHeaders(env)).forEach(([k, v]) => headers.set(k, v))

    return new Response(response.body, {
      status: response.status,
      headers,
    })
  },
}

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-goog-api-key',
    'Access-Control-Max-Age': '86400',
  }
}
