import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRole, AuthenticatedRequest } from '@/lib/auth-middleware'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(_req: AuthenticatedRequest) {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        kitchen: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            complaints: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ batches })
  } catch (error) {
    console.error('Error fetching batches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withRole('ADMIN')(handler)
