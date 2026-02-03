import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractToken } from '@/lib/jwt'
import { NextRequest } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and role
    const authHeader = req.headers.get('authorization')
    const token = extractToken(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await req.json()
    const { status } = body

    if (!status || !['ACTIVE', 'BLOCKED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (ACTIVE or BLOCKED)' },
        { status: 400 }
      )
    }

    const kitchen = await prisma.kitchen.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ kitchen })
  } catch (error) {
    console.error('Error updating kitchen:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
