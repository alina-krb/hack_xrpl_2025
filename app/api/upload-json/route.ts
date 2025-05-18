import { NextResponse } from "next/server"
import { PinataSDK } from "pinata"

if (!process.env.PINATA_JWT || !process.env.NEXT_PUBLIC_GATEWAY_URL) {
  throw new Error("PINATA_JWT et NEXT_PUBLIC_GATEWAY_URL doivent être définis dans .env.local")
}

const pinata = new PinataSDK({ 
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL
})

export async function POST(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing masterclass id' }, { status: 400 })
    }

    // Récupérer la masterclass à la volée via l'API interne
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/masterclasses`)
    const masterclasses = await res.json()
    const masterclass = masterclasses.find((mc: any) => mc.id === id)
    if (!masterclass) {
      return NextResponse.json({ success: false, error: 'Masterclass not found' }, { status: 404 })
    }

    // Créer un fichier JSON unique pour cette masterclass
    const file = new File(
      [JSON.stringify(masterclass, null, 2)], 
      `masterclass-${masterclass.id}.json`,
      { type: 'application/json' }
    )

    // Upload vers Pinata
    const result = await pinata.upload.public.file(file)
    
    // Créer les URLs
    const ipfsUri = `ipfs://${result.cid}`
    const gatewayUrl = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${result.cid}`

    return NextResponse.json({ 
      success: true, 
      ipfsUri,
      gatewayUrl,
      ipfsHash: result.cid,
      masterclassId: masterclass.id,
      fileName: `masterclass-${masterclass.id}.json`
    })
  } catch (error) {
    console.error("Error uploading to Pinata:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to upload to IPFS"
      },
      { status: 500 }
    )
  }
} 