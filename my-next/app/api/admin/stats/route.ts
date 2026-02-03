import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRole, AuthenticatedRequest } from '@/lib/auth-middleware'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(_req: AuthenticatedRequest) {
  try {
    const [
      totalUsers,
      activeUsers,
      totalKitchens,
      activeKitchens,
      totalBatches,
      activeBatches,
      totalComplaints,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.kitchen.count(),
      prisma.kitchen.count({ where: { status: 'ACTIVE' } }),
      prisma.batch.count(),
      prisma.batch.count({ 
        where: { 
          status: { in: ['CREATED', 'DISPATCHED', 'RECEIVED'] } 
        } 
      }),
      prisma.complaint.count(),
    ])

    // Get recent activity (last 10 batch events)
    const recentActivity = await prisma.batchEvent.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        batch: {
          include: {
            kitchen: {
              select: { name: true },
            },
          },
        },
      },
    })

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        kitchens: {
          total: totalKitchens,
          active: activeKitchens,
        },
        batches: {
          total: totalBatches,
          active: activeBatches,
        },
        complaints: totalComplaints,
      },
      recentActivity,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withRole('ADMIN')(handler)
