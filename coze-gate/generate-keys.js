// generate-keys.js - 本地运行，批量生成卡密并写入 Upstash Redis
// 用法：node generate-keys.js 100
// 运行前需设置环境变量：UPSTASH_REDIS_REST_URL 和 UPSTASH_REDIS_REST_TOKEN

import { Redis } from '@upstash/redis';
import { randomBytes } from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

function generateKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去掉易混淆字符 O/0/I/1
  const segments = 4;
  const segLen = 4;
  return Array.from({ length: segments }, () =>
    Array.from({ length: segLen }, () => chars[randomBytes(1)[0] % chars.length]).join('')
  ).join('-');
}

async function main() {
  const count = parseInt(process.argv[2]) || 10;
  const keys = [];

  for (let i = 0; i < count; i++) {
    keys.push(generateKey());
  }

  // 批量写入 Redis
  const pipeline = redis.pipeline();
  for (const key of keys) {
    pipeline.set(`key:${key}`, 'valid');
  }
  await pipeline.exec();

  console.log(`\n✅ 已生成并写入 ${count} 个卡密：\n`);
  keys.forEach(k => console.log(k));
  console.log('\n📋 复制以上卡密发给合作伙伴即可。');
}

main().catch(console.error);
