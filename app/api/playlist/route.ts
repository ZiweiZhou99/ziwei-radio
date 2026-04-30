import { NextResponse } from 'next/server'

// 网易云 API 代理（通过 MUSIC_U cookie 调用）
const NETEASE_BASE = process.env.NETEASE_API_BASE || 'https://neteasecloudmusicapi.vercel.app'
const COOKIE = process.env.NETEASE_COOKIE || ''
const DEFAULT_UID = process.env.NETEASE_USER_ID || ''

interface NeteasePlaylist {
  id: number
  name: string
  coverImgUrl: string
  trackCount: number
}

interface NeteaseTrack {
  id: number
  name: string
  ar: { name: string }[]
  al: { picUrl: string }
  dt: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const uid = searchParams.get('uid') || DEFAULT_UID

  if (!uid) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
  }

  try {
    // Get user playlists
    const playlistRes = await fetch(
      `${NETEASE_BASE}/user/playlist?uid=${uid}&cookie=${encodeURIComponent(COOKIE)}`,
      { next: { revalidate: 300 } }
    )
    const playlistData = await playlistRes.json()

    if (!playlistData.playlist?.length) {
      return NextResponse.json({ tracks: getMockTracks() })
    }

    // Use the first "liked songs" playlist (喜欢的音乐)
    const likedPlaylist: NeteasePlaylist = playlistData.playlist[0]

    // Get track list
    const detailRes = await fetch(
      `${NETEASE_BASE}/playlist/track/all?id=${likedPlaylist.id}&limit=50&cookie=${encodeURIComponent(COOKIE)}`
    )
    const detailData = await detailRes.json()
    const rawTracks: NeteaseTrack[] = detailData.songs || []

    // Get playable URLs
    const ids = rawTracks.map((t: NeteaseTrack) => t.id).join(',')
    const urlRes = await fetch(
      `${NETEASE_BASE}/song/url/v1?id=${ids}&level=standard&cookie=${encodeURIComponent(COOKIE)}`
    )
    const urlData = await urlRes.json()
    const urlMap: Record<number, string> = {}
    for (const item of urlData.data || []) {
      if (item.url) urlMap[item.id] = item.url
    }

    const tracks = rawTracks
      .filter((t: NeteaseTrack) => urlMap[t.id])
      .map((t: NeteaseTrack) => ({
        id: String(t.id),
        name: t.name,
        artist: t.ar.map((a: { name: string }) => a.name).join(' / '),
        cover: t.al.picUrl + '?param=200y200',
        duration: Math.floor(t.dt / 1000),
        url: urlMap[t.id],
      }))

    // Shuffle
    tracks.sort(() => Math.random() - 0.5)

    return NextResponse.json({ tracks })
  } catch (e) {
    console.error('Playlist API error:', e)
    return NextResponse.json({ tracks: getMockTracks() })
  }
}

function getMockTracks() {
  return [
    {
      id: 'mock-1',
      name: '暂无法加载歌单',
      artist: '请配置 NETEASE_COOKIE',
      cover: '',
      duration: 0,
      url: '',
    },
  ]
}
