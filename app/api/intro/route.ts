import { NextResponse } from 'next/server'

// 支持 Anthropic 直连 或 AWS Bedrock（通过环境变量自动切换）
async function callLLM(prompt: string): Promise<string> {
  // 优先用 Anthropic 直连
  if (process.env.ANTHROPIC_API_KEY) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })
    return (msg.content[0] as { text: string }).text
  }

  // Bedrock 方案（用服务器内置凭证）
  if (process.env.AWS_ACCESS_KEY_ID) {
    const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime')
    const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-west-2' })
    const body = JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })
    const cmd = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body,
      contentType: 'application/json',
    })
    const res = await client.send(cmd)
    const decoded = JSON.parse(new TextDecoder().decode(res.body))
    return decoded.content[0].text
  }

  throw new Error('No LLM configured')
}

export async function POST(request: Request) {
  const { songName, artist } = await request.json()

  if (!songName) {
    return NextResponse.json({ text: '', audioUrl: null })
  }

  try {
    const prompt = `你是一个有品位的私人 DJ。用一两句话介绍接下来要播放的歌曲，风格简洁有质感，不要说废话。

歌曲：${songName}
歌手/乐队：${artist}

要求：
- 30-60字以内
- 可以提到这首歌的背景、情绪、或者一个有趣的细节
- 不要以"接下来"或"下一首"开头，要自然
- 中文回复`

    const text = await callLLM(prompt)
    const audioUrl = `/api/tts?text=${encodeURIComponent(text)}`
    return NextResponse.json({ text, audioUrl })
  } catch (e) {
    console.error('Intro API error:', e)
    return NextResponse.json({
      text: `${artist} 的《${songName}》`,
      audioUrl: null,
    })
  }
}
