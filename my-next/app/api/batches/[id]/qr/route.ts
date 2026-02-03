// QR Code generation endpoint for batch
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'

// GET /api/batches/[id]/qr - Generate QR code for batch
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify batch exists
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        kitchen: {
          select: { name: true }
        }
      }
    })

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    // Generate QR code URL (points to scan page)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const scanUrl = `${baseUrl}/scan/${id}`

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(scanUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })

    return NextResponse.json({
      batchId: id,
      kitchenName: batch.kitchen.name,
      supplierName: batch.supplierName,
      scanUrl,
      qrCode: qrCodeDataUrl,
      createdAt: batch.createdAt,
      expiresAt: batch.expiresAt
    })
  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
