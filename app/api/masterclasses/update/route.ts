import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { id, ipfsUri, gatewayUrl, nftTokenIds } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }
    const data: any = {}
    if (ipfsUri) data.ipfsUri = ipfsUri
    if (gatewayUrl) data.gatewayUrl = gatewayUrl
    if (nftTokenIds) data.nftTokenIds = nftTokenIds
    const updated = await prisma.masterclass.update({
      where: { id },
      data,
    })
    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error('[POST /api/masterclasses/update]', error)
    return NextResponse.json({ error: 'Update failed', details: error instanceof Error ? error.message : error }, { status: 500 })
  }
} 