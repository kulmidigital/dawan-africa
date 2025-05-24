import { ImageResponse } from 'next/og'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'

export const alt = 'Dawan Africa - Uncovering the Continent Through Its Own Lens'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  // Read the logo file and convert to base64
  const logoData = await readFile(join(process.cwd(), 'public/logo.png'))
  const logoBase64 = `data:image/png;base64,${Buffer.from(logoData).toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to right, #000000, #2EC6FE)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <img
          src={logoBase64}
          alt="Dawan Africa Logo"
          style={{
            width: '300px',
            marginBottom: '40px',
          }}
        />
        <div
          style={{
            color: 'white',
            fontSize: '60px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '20px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          Uncovering the Continent
        </div>
        <div
          style={{
            color: 'white',
            fontSize: '40px',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          Through Its Own Lens
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
