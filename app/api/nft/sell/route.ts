import { NextResponse } from 'next/server'
import { createNftSellOffer } from '@/lib/xrpl'

export async function POST(req: Request) {
  try {
    const { nftId, priceXrp } = await req.json()
    if (!nftId || !priceXrp) {
      return NextResponse.json({ error: 'Missing nftId or priceXrp' }, { status: 400 })
    }
    const { offerId, tx, error } = await createNftSellOffer(nftId, priceXrp)
    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }
    return NextResponse.json({ success: true, offerId, tx })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : error }, { status: 500 })
  }
} 