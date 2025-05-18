import { NextResponse } from 'next/server'
import { mintMasterclassNFT } from '@/lib/xrpl'

export async function POST(req: Request) {
  try {
    const { id, gatewayUrl } = await req.json()
    if (!id || !gatewayUrl) {
      return NextResponse.json({ error: 'Missing id or gatewayUrl' }, { status: 400 })
    }
    const result = await mintMasterclassNFT({ id, gatewayUrl })
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('[POST /api/mint]', error)
    return NextResponse.json({ error: 'Mint failed', details: error instanceof Error ? error.message : error }, { status: 500 })
  }
} 