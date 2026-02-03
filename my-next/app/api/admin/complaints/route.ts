import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRole, AuthenticatedRequest } from '@/lib/auth-middleware'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(_req: AuthenticatedRequest) {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        batch: {
          include: {
            kitchen: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ complaints })
  } catch (error) {
    console.error('Error fetching complaints:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withRole('ADMIN')(handler)
