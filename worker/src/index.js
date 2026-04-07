/**
 * Gemini API 反向代理 - Cloudflare Worker
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com'

export default {
  async fetch(request, env) {
    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() })
    }

    // 只接受 POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      })
    }

    try {
      // 构造目标 URL
      const url = new URL(request.url)
      const targetUrl = new URL(url.pathname + url.search, GEMINI_API_BASE)

      // 移除前端 SDK 传来的占位 key，注入真实 key
      targetUrl.searchParams.delete('key')
      targetUrl.searchParams.set('key', env.GEMINI_API_KEY)

      // 转发请求到 Google
      const response = await fetch(targetUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': request.headers.get('Content-Type') || 'application/json',
        },
        body: request.body,
      })

      // 返回响应（保留 streaming）
      const headers = new Headers(response.headers)
      Object.entries(corsHeaders()).forEach(([k, v]) => headers.set(k, v))

      return new Response(response.body, {
        status: response.status,
        headers,
      })
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      })
    }
  },
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-goog-api-key, x-goog-api-client',
    'Access-Control-Max-Age': '86400',
  }
}
