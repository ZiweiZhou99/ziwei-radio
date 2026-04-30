# ziwei-radio

周子威的个人主页 + 私人电台。

## 功能

- **个人主页** — 关于我 + 博客（Markdown 文件直接编辑）
- **作品集** — Vibe Coding 小实验
- **私人电台** — 网易云歌单 + AI 主播 + 粒子律动背景

## 快速开始

```bash
# 安装依赖
npm install

# 安装 edge-tts（Python）
pip install edge-tts

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 NETEASE_COOKIE 和 ANTHROPIC_API_KEY

# 开发模式
npm run dev

# 构建
npm run build
npm start
```

## 内容编辑

所有内容在 `content/` 目录：

- `about.md` — 主页个人介绍
- `blog/*.md` — 博客文章（支持 frontmatter: title, date, description）
- `works.json` — 作品集数据

直接编辑文件，重新部署即可。

## 网易云 Cookie 获取

1. 浏览器打开 music.163.com 并登录
2. F12 → Application → Cookies → music.163.com
3. 复制 `MUSIC_U` 的值填入 `.env.local`

## 部署

```bash
# 在服务器上
git pull
npm install
npm run build
pm2 restart ziwei-radio  # 或者 systemctl restart ziwei-radio
```

## 技术栈

- Next.js 14 (App Router)
- Three.js + WebAudio API（粒子律动）
- Tailwind CSS
- Claude API（歌曲介绍 + DJ 对话）
- edge-tts（TTS）
