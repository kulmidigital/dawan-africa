import { ImageResponse } from 'next/og'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { getGlobalMarketData } from '@/lib/market-data'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  // Get market data
  const marketData = await getGlobalMarketData()

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
          padding: '40px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <img
            src={logoBase64}
            alt="Dawan Africa Logo"
            style={{
              width: '200px',
            }}
          />
        </div>
        <div
          style={{
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
            lineHeight: 1.2,
            marginBottom: '20px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          African Financial Markets
        </div>
        <div
          style={{
            color: '#E0E0E0',
            fontSize: '24px',
            lineHeight: 1.4,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            marginBottom: '30px',
          }}
        >
          Real-time market data and analysis
        </div>
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '20px',
              borderRadius: '10px',
              flex: 1,
            }}
          >
            <div style={{ color: '#E0E0E0', fontSize: '16px', marginBottom: '8px' }}>
              Total Market Cap
            </div>
            <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
              ${(marketData.totalMarketCap / 1e9).toFixed(2)}B
            </div>
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '20px',
              borderRadius: '10px',
              flex: 1,
            }}
          >
            <div style={{ color: '#E0E0E0', fontSize: '16px', marginBottom: '8px' }}>
              24h Volume
            </div>
            <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
              ${(marketData.totalVolume / 1e9).toFixed(2)}B
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
