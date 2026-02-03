'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({ users: 0, kitchens: 0, batches: 0 })
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [showQRModal, setShowQRModal] = useState(false)

  useEffect(() => {
    // Fetch stats
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const generateQRCode = async () => {
    try {
      // Dynamic import for QRCode (CommonJS module)
      const QRCode = (await import('qrcode')).default
      
      // Generate a unique session token for QR authentication
      const sessionId = crypto.randomUUID()
      const qrData = JSON.stringify({
        type: 'auth',
        sessionId,
        timestamp: Date.now(),
        expiresIn: 300000 // 5 minutes
      })
      
      const url = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      setQrCodeUrl(url)
      setShowQRModal(true)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  {user?.name} ({user?.role})
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-600 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-semibold text-gray-600">
                          Total Users
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {stats.users}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-600 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-semibold text-gray-600">
                          Active Kitchens
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {stats.kitchens}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-amber-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-semibold text-gray-600">
                          Total Batches
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {stats.batches}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Authentication Card */}
            <div className="mt-8 bg-white shadow-md rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                QR Code Authentication
              </h2>
              <p className="text-gray-700 mb-4">
                Generate a QR code to allow quick authentication for kitchen or pantry staff.
              </p>
              <button
                onClick={generateQRCode}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Generate QR Code
              </button>
            </div>

            {/* Admin Controls */}
            <div className="mt-8 bg-white shadow-md rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Admin Controls
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center px-4 py-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                  <div className="flex-shrink-0 bg-blue-600 rounded-md p-2 mr-4">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-semibold">Manage Users</span>
                </button>
                <button className="flex items-center px-4 py-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                  <div className="flex-shrink-0 bg-green-600 rounded-md p-2 mr-4">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-semibold">Manage Kitchens</span>
                </button>
                <button className="flex items-center px-4 py-4 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors">
                  <div className="flex-shrink-0 bg-amber-500 rounded-md p-2 mr-4">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-semibold">View All Batches</span>
                </button>
                <button className="flex items-center px-4 py-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors">
                  <div className="flex-shrink-0 bg-red-600 rounded-md p-2 mr-4">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-semibold">View Complaints</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                Scan to Authenticate
              </h3>
              <div className="flex justify-center mb-4">
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="QR Code" className="rounded-lg border border-gray-200" />
                )}
              </div>
              <p className="text-sm text-gray-600 text-center mb-6">
                This QR code expires in 5 minutes. Scan with a mobile device to authenticate.
              </p>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full px-4 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
