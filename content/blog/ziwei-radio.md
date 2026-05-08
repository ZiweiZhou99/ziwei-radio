---
title: "ziwei radio：一个有温度的私人电台"
date: "2026-04-30"
tags: ["vibe coding", "产品思考", "AI", "Three.js"]
---

市面上的音乐播放器要么太重，要么太冷。我想做一个**有温度的私人电台**——不只是放歌，而是有人在旁边陪你听。

参考的是 [Claudio FM](https://claudio.fm)，那种暗色调、大时钟、terminal 感的风格，很适合一个人深夜工作的氛围。

---

## 三个核心体验

### 粒子背景 × 音频可视化

不是纯装饰。粒子会**随音乐律动**——用 WebAudio API 实时分析频谱，驱动 Three.js 粒子的位移和亮度。音乐高潮时粒子炸开，安静时收拢。颜色是蓝紫色，在黑色背景上有点像宇宙。

技术上用了 GLSL Shader 写粒子，每帧传入音频数据驱动 uniform 变量，效率比纯 JS 控制高得多。

### AI 主播介绍

每首歌播放前，AI 会用 1-2 句话介绍这首歌。不是从 Wikipedia 抄的，是用 Claude 生成的，有点像电台 DJ 的即兴感。然后用 edge-tts（`zh-CN-YunxiNeural` 声音）合成语音播出来——这个声音选得比较有磁性，像个真人在说话。

### DJ 聊天 × 音量压制

聊天框发消息，AI DJ 会回应。关键交互：**对话时音量自动从 100% 压到 20%**，就像真电台主持人说话时背景音乐会降下来一样。聊完之后音量恢复。

这个细节是整个体验里最"真"的地方。

---

## 技术架构

```
浏览器
├── Three.js 粒子场景
│   └── WebAudio AnalyserNode → 实时频谱 → GLSL uniform
├── RadioPlayer（状态机）
│   ├── 歌单：/api/playlist → NeteaseCloudMusicApi → 网易云
│   ├── 播放：<audio> 直接请求网易云 CDN
│   ├── 介绍：/api/intro → AWS Bedrock Claude → 文字
│   └── 语音：/api/tts → edge-tts → .mp3
└── DJChat
    └── /api/chat → AWS Bedrock Claude → 回复
        └── 发送时：audioEl.volume = 0.2
            收到时：audioEl.volume = 1.0
```

**伪电台设计**：每个用户进来播放进度是独立的，随机从歌单里选一首开始。不用维护全局状态，也没有"大家同时听同一首"的社交压力。

---

## 产品视角的思考

radio 这个功能本质上是在回答一个问题：

> **一个人独处时，什么样的数字伴侣是舒服的？**

不打扰，但在。会说话，但不啰嗦。有个性，但不刷存在感。

这其实也是我平时做 C 端产品会思考的问题——AI 功能什么时候出现、出现多久、怎么退出，是比"AI 能不能做到"更难的设计命题。

radio 是我给自己的一个答案。去[电台页面](/radio)听一听 🎵
