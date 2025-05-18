// /app/api/users/route.ts
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' },
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error('[GET /api/users]', error)
    return new NextResponse('Erreur lors de la récupération des utilisateurs', { status: 500 })
  }
}

