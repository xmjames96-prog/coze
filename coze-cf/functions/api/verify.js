// functions/verify.js - Cloudflare Pages Function
export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { key } = await request.json();
    if (!key) {
      return new Response(JSON.stringify({ success: false, message: '请输入卡密' }), { headers: corsHeaders });
    }

    const cleanKey = key.trim().toUpperCase();
    const UPSTASH_URL = env.UPSTASH_REDIS_REST_URL;
    const UPSTASH_TOKEN = env.UPSTASH_REDIS_REST_TOKEN;

    // 查询卡密状态
    const getRes = await fetch(`${UPSTASH_URL}/get/key:${encodeURIComponent(cleanKey)}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });
    const getData = await getRes.json();
    const status = getData.result;

    if (status === null) {
      return new Response(JSON.stringify({ success: false, message: '卡密无效，请检查输入' }), { headers: corsHeaders });
    }
    if (status === 'used') {
      return new Response(JSON.stringify({ success: false, message: '该卡密已使用，无法重复激活' }), { headers: corsHeaders });
    }
    if (status === 'valid') {
      // 标记为已使用
      await fetch(`${UPSTASH_URL}/set/key:${encodeURIComponent(cleanKey)}/used`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
      });
      return new Response(JSON.stringify({
        success: true,
        message: '验证成功',
        redirectUrl: env.COZE_BOT_URL
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: false, message: '卡密状态异常，请联系客服' }), { headers: corsHeaders });

  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: '服务器错误，请稍后重试' }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
