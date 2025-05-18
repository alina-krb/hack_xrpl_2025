// /app/api/masterclasses/route.ts
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const masterclasses = await prisma.masterclass.findMany({
      orderBy: { id: 'asc' },
    })
    return NextResponse.json(masterclasses)
  } catch (error) {
    console.error('[GET /api/masterclasses]', error)
    return new NextResponse('Erreur lors de la récupération des masterclasses', { status: 500 })
  }
}
