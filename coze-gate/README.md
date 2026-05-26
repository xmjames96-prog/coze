# 智能助手卡密验证系统

## 项目结构

```
coze-gate/
├── api/
│   └── verify.js        # Vercel 云函数，处理卡密验证
├── public/
│   └── index.html       # H5 前端页面
├── generate-keys.js     # 本地批量生成卡密脚本
├── package.json
└── vercel.json
```

---

## 部署步骤

### 第一步：注册 Upstash（免费数据库）

1. 访问 https://upstash.com 注册账号（可用 GitHub 登录）
2. 点击 **Create Database** → 选择 **Redis**
3. 地区选 **ap-east-1（香港）**，国内访问最快
4. 创建后，在数据库详情页找到：
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
5. 把这两个值复制保存好

---

### 第二步：部署到 Vercel

1. 访问 https://vercel.com 注册账号
2. 把本项目文件夹上传到 GitHub（新建仓库，把所有文件推上去）
3. 在 Vercel 控制台点击 **Add New Project** → 选择你的 GitHub 仓库 → Deploy
4. 部署完成后，进入项目 **Settings → Environment Variables**，添加以下三个变量：

| 变量名 | 值 |
|--------|-----|
| `UPSTASH_REDIS_REST_URL` | 第一步复制的 URL |
| `UPSTASH_REDIS_REST_TOKEN` | 第一步复制的 Token |
| `COZE_BOT_URL` | 你的扣子 Bot 链接 |

5. 添加完后，点击 **Redeploy** 让变量生效

---

### 第三步：生成卡密

在本地电脑安装 Node.js 后，运行：

```bash
# 安装依赖
npm install

# 设置环境变量（Mac/Linux）
export UPSTASH_REDIS_REST_URL="你的URL"
export UPSTASH_REDIS_REST_TOKEN="你的Token"

# Windows PowerShell
$env:UPSTASH_REDIS_REST_URL="你的URL"
$env:UPSTASH_REDIS_REST_TOKEN="你的Token"

# 生成 50 个卡密
node generate-keys.js 50
```

终端会输出所有卡密，复制给合作伙伴即可。

---

## 使用流程

```
你生成卡密 → 批发给合作伙伴（收钱）
合作伙伴把卡密卖给用户
用户打开你的 Vercel 链接 → 输入卡密 → 跳转扣子 Bot
```

---

## 常见问题

**Q：用户的卡密会不会被别人猜到？**
A：卡密格式为 `XXXX-XXXX-XXXX-XXXX`，字符集去掉了易混淆的 O/0/I/1，随机空间超过 10 亿，无法暴力破解。

**Q：国内能正常访问吗？**
A：Upstash 香港节点 + Vercel 边缘网络，国内访问稳定，延迟约 50-100ms。

**Q：免费额度够用吗？**
A：Upstash 免费版每天 10,000 次请求，每个卡密验证消耗 2-3 次请求，足够每天验证 3,000+ 个卡密。Vercel 免费版每月 100GB 流量，完全够用。
