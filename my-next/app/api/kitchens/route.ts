// Kitchens API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

// GET /api/kitchens - Get all kitchens
export async function GET(req: NextRequest) {
  try {
    const kitchens = await prisma.kitchen.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ kitchens })
  } catch (error) {
    console.error('Get kitchens error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/kitchens - Create new kitchen (Admin only)
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

    // Only ADMIN role can create kitchens
    if (payload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admin can create kitchens' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Kitchen name is required' },
        { status: 400 }
      )
    }

    const kitchen = await prisma.kitchen.create({
      data: { name }
    })

    return NextResponse.json({
      message: 'Kitchen created successfully',
      kitchen
    }, { status: 201 })
  } catch (error) {
    console.error('Create kitchen error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
