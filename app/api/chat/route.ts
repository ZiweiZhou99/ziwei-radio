import { NextResponse } from 'next/server'

async function callLLM(system: string, messages: { role: string; content: string }[]): Promise<string> {
  if (process.env.ANTHROPIC_API_KEY) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const res = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      system,
      messages: messages as { role: 'user' | 'assistant'; content: string }[],
    })
    return (res.content[0] as { text: string }).text
  }

  if (process.env.AWS_ACCESS_KEY_ID) {
    const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime')
    const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-west-2' })
    const body = JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 150,
      system,
      messages,
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

const DJ_SYSTEM = `你是一个私人 DJ，名字叫 ZW Radio。
你了解用户的音乐品味，话不多但有品位。
你正在为用户播放他的歌单，偶尔会聊聊音乐或生活。
回复要简短自然，不超过60字。
不要过于正式，也不要用"您"，直接用"你"。
如果用户问歌曲相关的问题，结合当前播放的歌曲回答。`

export async function POST(request: Request) {
  const { message, currentSong, history } = await request.json()

  try {
    const messages = [
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role === 'dj' ? 'assistant' : 'user',
        content: h.content,
      })),
      { role: 'user', content: message },
    ]

    const contextNote = currentSong
      ? `\n\n当前正在播放：${currentSong.artist} - 《${currentSong.name}》`
      : ''

    const reply = await callLLM(DJ_SYSTEM + contextNote, messages)
    const audioUrl = `/api/tts?text=${encodeURIComponent(reply)}`
    return NextResponse.json({ reply, audioUrl })
  } catch (e) {
    console.error('Chat API error:', e)
    return NextResponse.json({ reply: '信号有点乱，再说一次？', audioUrl: null })
  }
}
