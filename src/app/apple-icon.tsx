import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Spoofed UA so Google Fonts serves WOFF (Satori supports ttf/otf/woff, NOT woff2).
const GOOGLE_FONTS_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:5.0.1) Gecko/20100101 Firefox/5.0.1'

async function loadGoogleFont(spec: string): Promise<ArrayBuffer> {
  const css = await fetch(`https://fonts.googleapis.com/css2?${spec}&display=swap`, {
    headers: { 'User-Agent': GOOGLE_FONTS_UA },
  }).then((r) => r.text())
  const match = css.match(
    /src:\s*url\((.+?)\)\s*format\(['"]?(woff|truetype|opentype)['"]?\)/,
  )
  if (!match) throw new Error(`Failed to extract font URL from Google Fonts CSS: ${spec}`)
  return fetch(match[1]!).then((r) => r.arrayBuffer())
}

export default async function AppleIcon() {
  const [playfairBlack, playfairBoldItalic] = await Promise.all([
    loadGoogleFont('family=Playfair+Display:wght@900&text=P'),
    loadGoogleFont('family=Playfair+Display:ital,wght@1,700&text=S'),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#ebe5d8',
          color: '#111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          letterSpacing: '-0.02em',
        }}
      >
        <span style={{ fontFamily: 'Playfair-P', fontWeight: 900, fontSize: 124 }}>P</span>
        <span
          style={{
            fontFamily: 'Playfair-S',
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: 124,
          }}
        >
          S
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Playfair-P',
          data: playfairBlack,
          style: 'normal' as const,
          weight: 900,
        },
        {
          name: 'Playfair-S',
          data: playfairBoldItalic,
          style: 'italic' as const,
          weight: 700,
        },
      ],
    },
  )
}
