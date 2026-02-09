import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRole, AuthenticatedRequest } from '@/lib/auth-middleware'
import { BatchStatus } from '@prisma/client'
import { randomUUID } from 'crypto'

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

    return NextResponse.json(batches)
  } catch (error) {
    console.error('Error fetching batches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    console.log('Received batch creation request:', body)
    const { kitchenId, supplierName, expiresAt, foodItem, qrCode } = body

    // Validate required fields
    if (!kitchenId || !supplierName || !expiresAt || !foodItem) {
      console.log('Validation failed:', { kitchenId, supplierName, expiresAt, foodItem })
      return NextResponse.json(
        { error: 'Kitchen ID, supplier name, expiration date, and food item are required' },
        { status: 400 }
      )
    }

    // Trim strings and validate they're not empty
    const trimmedKitchenId = kitchenId.trim()
    const trimmedSupplierName = supplierName.trim()
    const trimmedFoodItem = foodItem.trim()
    const finalQrCode = qrCode?.trim() || `QR-${randomUUID()}`

    if (!trimmedKitchenId || !trimmedSupplierName || !trimmedFoodItem) {
      console.log('Validation failed after trim:', { trimmedKitchenId, trimmedSupplierName, trimmedFoodItem })
      return NextResponse.json(
        { error: 'Kitchen ID, supplier name, and food item cannot be empty' },
        { status: 400 }
      )
    }

    // Validate kitchen exists
    const kitchen = await prisma.kitchen.findUnique({
      where: { id: trimmedKitchenId }
    })

    if (!kitchen) {
      return NextResponse.json(
        { error: 'Kitchen not found' },
        { status: 404 }
      )
    }

    // Validate expiration date
    const expirationDate = new Date(expiresAt)
    if (isNaN(expirationDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid expiration date' },
        { status: 400 }
      )
    }

    console.log('Creating batch with data:', {
      id: randomUUID(),
      kitchenId: trimmedKitchenId,
      supplierName: trimmedSupplierName,
      foodItem: trimmedFoodItem,
      qrCode: finalQrCode,
      status: 'CREATED',
      expiresAt: expirationDate,
    })

    const batch = await prisma.batch.create({
      data: {
        id: randomUUID(),
        kitchenId: trimmedKitchenId,
        supplierName: trimmedSupplierName,
        foodItem: trimmedFoodItem,
        qrCode: finalQrCode,
        status: BatchStatus.CREATED,
        expiresAt: expirationDate,
      },
      include: {
        kitchen: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(batch, { status: 201 })
  } catch (error: any) {
    console.error('Error creating batch:', error)
    console.error('Error details:', {
      code: error.code,
      meta: JSON.stringify(error.meta, null, 2),
      message: error.message,
      clientVersion: error.clientVersion,
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        code: error.code,
        meta: error.meta
      },
      { status: 500 }
    )
  }
}

export const GET = withRole('ADMIN', 'KITCHEN')(handler)
export const POST = withRole('ADMIN', 'KITCHEN')(createHandler)
