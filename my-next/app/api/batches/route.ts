// Batch API endpoints - Create batch (Kitchen only)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

// GET /api/batches - Get all batches (for kitchen user)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get batches based on role
    const batches = await prisma.batch.findMany({
      include: {
        kitchen: true,
        events: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ batches })
  } catch (error) {
    console.error('Get batches error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/batches - Create new batch (Kitchen only)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Only KITCHEN role can create batches
    if (payload.role !== 'KITCHEN') {
      return NextResponse.json(
        { error: 'Only kitchen staff can create batches' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { kitchenId, supplierName, expiresInHours = 24 } = body

    if (!kitchenId || !supplierName) {
      return NextResponse.json(
        { error: 'Kitchen ID and supplier name are required' },
        { status: 400 }
      )
    }

    // Verify kitchen exists and is active
    const kitchen = await prisma.kitchen.findUnique({
      where: { id: kitchenId }
    })

    if (!kitchen) {
      return NextResponse.json({ error: 'Kitchen not found' }, { status: 404 })
    }

    if (kitchen.status === 'BLOCKED') {
      return NextResponse.json(
        { error: 'Kitchen is blocked and cannot create batches' },
        { status: 403 }
      )
    }

    // Calculate expiration time
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expiresInHours)

    // Create batch with initial CREATED event
    const batch = await prisma.batch.create({
      data: {
        kitchenId,
        supplierName,
        status: 'CREATED',
        expiresAt,
        events: {
          create: {
            eventType: 'CREATED',
            actorRole: 'KITCHEN'
          }
        }
      },
      include: {
        kitchen: true,
        events: true
      }
    })

    return NextResponse.json({
      message: 'Batch created successfully',
      batch
    }, { status: 201 })
  } catch (error) {
    console.error('Create batch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
