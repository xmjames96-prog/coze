// api/verify.js - Vercel Serverless Function
// 依赖：@upstash/redis（在 Vercel 控制台安装）

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  // 跨域支持
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  const { key } = req.body;

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ success: false, message: '请输入卡密' });
  }

  const cleanKey = key.trim().toUpperCase();

  try {
    // 检查卡密是否存在
    const status = await redis.get(`key:${cleanKey}`);

    if (status === null) {
      return res.status(200).json({ success: false, message: '卡密无效，请检查输入' });
    }

    if (status === 'used') {
      return res.status(200).json({ success: false, message: '该卡密已使用，无法重复激活' });
    }

    if (status === 'valid') {
      // 标记为已使用
      await redis.set(`key:${cleanKey}`, 'used');
      await redis.set(`key:${cleanKey}:used_at`, new Date().toISOString());

      return res.status(200).json({
        success: true,
        message: '验证成功',
        redirectUrl: process.env.COZE_BOT_URL
      });
    }

    return res.status(200).json({ success: false, message: '卡密状态异常，请联系客服' });

  } catch (err) {
    console.error('Redis error:', err);
    return res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
  }
}
