import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { qrCode, trainNo, passengerName, message } = body

    // Validate required fields
    if (!qrCode || !trainNo || !message) {
      return NextResponse.json(
        { error: 'QR code, train number, and message are required' },
        { status: 400 }
      )
    }

    // Find the batch by QR code
    const batch = await prisma.batch.findUnique({
      where: { qrCode: qrCode },
    })

    if (!batch) {
      return NextResponse.json(
        { error: 'Invalid QR code. Batch not found.' },
        { status: 404 }
      )
    }

    // Create the complaint with passenger name included in message
    const complaintMessage = passengerName 
      ? `Passenger: ${passengerName}\n\n${message}`
      : message

    const complaint = await prisma.complaint.create({
      data: {
        batchId: batch.id,
        trainNo: trainNo.trim(),
        message: complaintMessage.trim(),
      },
      include: {
        batch: {
          include: {
            kitchen: true,
          },
        },
      },
    })

    return NextResponse.json(
      { 
        success: true,
        complaint: {
          id: complaint.id,
          trainNo: complaint.trainNo,
          createdAt: complaint.createdAt,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating complaint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
