import { NextResponse } from 'next/server'
import xrpl from 'xrpl'

export async function POST(req: Request) {
  try {
    const { offerId } = await req.json()
    if (!offerId) {
      return NextResponse.json({ error: 'Missing offerId' }, { status: 400 })
    }
    const seed = process.env.NEXT_PUBLIC_XPRL_SEED_BUYER!
    const client = new xrpl.Client('wss://testnet.xrpl.org:51233')
    await client.connect()
    const wallet = xrpl.Wallet.fromSeed(seed)
    const acceptOfferTx = {
      TransactionType: 'NFTokenAcceptOffer' as const,
      Account: wallet.classicAddress,
      NFTokenSellOffer: offerId
    }
    const prepared = await client.autofill(acceptOfferTx)
    const signed = wallet.sign(prepared)
    const result = await client.submitAndWait(signed.tx_blob)
    await client.disconnect()
    return NextResponse.json({ success: true, tx: result })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : error }, { status: 500 })
  }
} 