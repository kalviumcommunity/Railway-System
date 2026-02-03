import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [users, kitchens, batches] = await Promise.all([
      prisma.user.count(),
      prisma.kitchen.count({ where: { status: 'ACTIVE' } }),
      prisma.batch.count(),
    ])

    return NextResponse.json({
      users,
      kitchens,
      batches,
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
