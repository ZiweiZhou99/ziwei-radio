# 任务：ziwei-radio 个人主页 + 私人电台

## 项目概述
为 zhouziwei.online 构建一个个人主页，包含：
1. 个人主页（关于我 + 博客文章）
2. Vibe Coding 作品集展示
3. 私人电台（核心功能）

## 技术栈
- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **动画**: Three.js + WebAudio API（粒子律动背景）
- **音乐**: 网易云 Cookie 方案（MUSIC_U）
- **AI主播**: LLM 生成介绍文案 + TTS 播出
- **部署**: 自有服务器（zhouziwei.online）

## 目录结构
```
ziwei-radio/
├── app/
│   ├── page.tsx              # 主页（关于我）
│   ├── works/page.tsx        # Vibe Coding 作品集
│   ├── radio/page.tsx        # 私人电台
│   └── blog/
│       ├── page.tsx          # 博客列表
│       └── [slug]/page.tsx   # 博客详情
├── components/
│   ├── ParticleBackground.tsx  # Three.js 粒子律动背景
│   ├── RadioPlayer.tsx         # 电台播放器 UI
│   ├── DJChat.tsx              # AI 伪主播对话框
│   └── Nav.tsx                 # 导航栏
├── app/api/
│   ├── playlist/route.ts       # 拉取网易云歌单
│   ├── intro/route.ts          # LLM 生成歌曲介绍
│   ├── chat/route.ts           # 伪主播对话
│   └── tts/route.ts            # TTS 文字转语音
├── content/
│   ├── about.md                # 关于我（可编辑）
│   ├── blog/                   # 博客文章（Markdown）
│   │   └── hello-world.md
│   └── works.json              # 作品集数据
└── .env.local.example          # 环境变量示例
```

## 核心功能详细说明

### 🎵 私人电台
- 从网易云拉取用户公开歌单（通过 MUSIC_U cookie）
- 播放前：LLM 生成 30-60 字的歌曲介绍，TTS 播出，介绍完毕后自动开始播放音乐
- 播放中：WebAudio API 分析音频频率，驱动 Three.js 粒子系统
- 用户可与 AI 伪主播对话，对话时音乐音量 duck 到 30%，对话结束后恢复

### 🌌 粒子律动背景（参考 Claudio FM 风格）
- 黑色背景，蓝紫色粒子（#7B68EE, #9370DB, #4169E1）
- 粒子围绕中心球形分布，随音频低频扩散、高频加速
- Three.js BufferGeometry + custom GLSL shader
- 无音频时：粒子缓慢呼吸律动

### 🤖 AI 伪主播
- 人设：你的私人 DJ，了解你的音乐品味，话不多但有品位
- 介绍歌曲：调用 Claude/GPT 生成文案，风格简洁有质感
- 对话接口：带上下文（当前歌曲 + 对话历史）

### 📝 博客/CMS
- Markdown 文件存 content/blog/ 目录
- Next.js 读取本地 md，支持 frontmatter（title, date, description）
- 直接 SSH 改文件部署

## API 接口设计

### GET /api/playlist
- Query: `uid` (网易云用户ID) or 使用默认（从env读取）
- Returns: 歌单列表 + 歌曲信息（id, name, artist, cover）

### POST /api/intro
- Body: `{ songId, songName, artist }`
- Returns: `{ text: "介绍文案", audioUrl: "tts音频url" }`

### POST /api/chat
- Body: `{ message, currentSong, history }`
- Returns: `{ reply: "主播回复", audioUrl: "tts音频url" }`

### GET /api/tts
- Query: `text`
- Returns: audio stream (mp3)

## 环境变量
```
NETEASE_COOKIE=MUSIC_U=xxxxx
NETEASE_USER_ID=xxxxx
ANTHROPIC_API_KEY=xxxxx  # 或 OPENAI_API_KEY
EDGE_TTS_VOICE=zh-CN-YunxiNeural  # 中文男声，有质感
```

## 样式设计
- 整体风格：深色，极简，科技感
- 主色调：黑 (#0a0a0a) + 蓝紫 (#7B68EE)
- 字体：等宽字体（Mono）用于时钟/代码，无衬线用于正文
- 参考：Claudio FM 的 dark terminal 风格

## 电台 UI 组件
参考 Claudio FM 截图：
- 顶部：当前时间（大字体等宽）+ ON AIR 状态
- 中间：当前歌曲信息 + 进度条 + 控制按钮
- 下方：待播队列（最多显示 5 首）
- 底部：AI 主播对话框（"Say something to the DJ..."）

## 注意事项
1. 网易云音乐 URL 通过非官方 API 获取（部署时需要 MUSIC_U cookie）
2. 如果网易云获取失败，fallback 到 YouTube 搜索链接
3. 粒子背景必须响应式，移动端适当降低粒子数量（500 vs 2000）
4. TTS 使用 edge-tts（npm package），免费，质量好

## 完成后
当所有文件创建完毕后，运行：
openclaw system event --text "Done: ziwei-radio 项目骨架搭建完成，Next.js + Three.js 粒子电台 + AI主播 + 网易云接口，路径: /root/.openclaw/workspace/ziwei-radio" --mode now
