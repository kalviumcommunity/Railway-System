import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRole, AuthenticatedRequest } from '@/lib/auth-middleware'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(_req: AuthenticatedRequest) {
  try {
    const kitchens = await prisma.kitchen.findMany({
      include: {
        batches: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            batches: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(kitchens)
  } catch (error) {
    console.error('Error fetching kitchens:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Kitchen name is required' },
        { status: 400 }
      )
    }

    const kitchen = await prisma.kitchen.create({
      data: {
        name,
        status: 'ACTIVE',
      },
    })

    return NextResponse.json(kitchen, { status: 201 })
  } catch (error) {
    console.error('Error creating kitchen:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withRole('ADMIN', 'KITCHEN')(handler)
export const POST = withRole('ADMIN', 'KITCHEN')(createHandler)
