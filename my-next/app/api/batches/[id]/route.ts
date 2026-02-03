// Get batch by ID - Public endpoint
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/batches/[id] - Public endpoint to fetch batch info
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        kitchen: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        events: {
          orderBy: { createdAt: 'asc' }
        },
        complaints: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    // Check if batch is expired
    const isExpired = new Date() > new Date(batch.expiresAt)
    
    return NextResponse.json({
      batch: {
        ...batch,
        isExpired
      }
    })
  } catch (error) {
    console.error('Get batch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
