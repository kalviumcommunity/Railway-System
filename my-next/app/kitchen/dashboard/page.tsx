'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'

interface Kitchen {
  id: string
  name: string
  status: string
}

interface Batch {
  id: string
  supplierName: string
  status: string
  createdAt: string
  expiresAt: string
  kitchen: Kitchen
}

interface QRData {
  qrCode: string
  scanUrl: string
  batchId: string
  kitchenName: string
  supplierName: string
  createdAt: string
  expiresAt: string
}

export default function KitchenDashboard() {
  const { user, logout } = useAuth()
  const [activeView, setActiveView] = useState<'menu' | 'create' | 'list' | 'qr'>('menu')
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [qrData, setQrData] = useState<QRData | null>(null)
  
  // Form state
  const [selectedKitchen, setSelectedKitchen] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [expiresInHours, setExpiresInHours] = useState(24)

  // Fetch kitchens on mount
  useEffect(() => {
    fetchKitchens()
  }, [])

  const fetchKitchens = async () => {
    try {
      const res = await fetch('/api/kitchens')
      const data = await res.json()
      if (data.kitchens) {
        setKitchens(data.kitchens.filter((k: Kitchen) => k.status === 'ACTIVE'))
      }
    } catch (error) {
      console.error('Failed to fetch kitchens:', error)
    }
  }

  const fetchBatches = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/batches')
      const data = await res.json()
      if (data.batches) {
        setBatches(data.batches)
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kitchenId: selectedKitchen,
          supplierName,
          expiresInHours
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Batch created successfully!' })
        // Fetch QR code for the new batch
        const qrRes = await fetch(`/api/batches/${data.batch.id}/qr`)
        const qrDataResponse = await qrRes.json()
        setQrData(qrDataResponse)
        setActiveView('qr')
        // Reset form
        setSupplierName('')
        setExpiresInHours(24)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create batch' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const viewBatchQR = async (batchId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/batches/${batchId}/qr`)
      const data = await res.json()
      setQrData(data)
      setActiveView('qr')
    } catch (error) {
      console.error('Failed to fetch QR:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <ProtectedRoute allowedRoles={['KITCHEN']}>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Kitchen Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user?.name} ({user?.role})
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Message Alert */}
            {message && (
              <div className={`mb-4 p-4 rounded-md ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            {/* Main Menu */}
            {activeView === 'menu' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Batch Management
                </h2>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveView('create')}
                    className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-md text-blue-900 font-medium"
                  >
                    ➕ Create New Batch
                  </button>
                  <button 
                    onClick={() => {
                      fetchBatches()
                      setActiveView('list')
                    }}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md"
                  >
                    📋 View My Batches
                  </button>
                </div>
              </div>
            )}

            {/* Create Batch Form */}
            {activeView === 'create' && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Create New Batch</h2>
                  <button 
                    onClick={() => setActiveView('menu')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ← Back
                  </button>
                </div>
                
                <form onSubmit={handleCreateBatch} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kitchen
                    </label>
                    <select
                      value={selectedKitchen}
                      onChange={(e) => setSelectedKitchen(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a kitchen</option>
                      {kitchens.map((kitchen) => (
                        <option key={kitchen.id} value={kitchen.id}>
                          {kitchen.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Name
                    </label>
                    <input
                      type="text"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      required
                      placeholder="Enter supplier name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expires In (hours)
                    </label>
                    <input
                      type="number"
                      value={expiresInHours}
                      onChange={(e) => setExpiresInHours(parseInt(e.target.value))}
                      min="1"
                      max="168"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Default: 24 hours. Maximum: 168 hours (1 week)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Batch & Generate QR'}
                  </button>
                </form>
              </div>
            )}

            {/* Batch List */}
            {activeView === 'list' && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">My Batches</h2>
                  <button 
                    onClick={() => setActiveView('menu')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ← Back
                  </button>
                </div>
                
                {loading ? (
                  <p className="text-center text-gray-500">Loading batches...</p>
                ) : batches.length === 0 ? (
                  <p className="text-center text-gray-500">No batches found. Create your first batch!</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {batches.map((batch) => {
                          const isExpired = new Date() > new Date(batch.expiresAt)
                          return (
                            <tr key={batch.id}>
                              <td className="px-4 py-3 text-sm text-gray-900">{batch.supplierName}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  isExpired ? 'bg-red-100 text-red-800' :
                                  batch.status === 'CREATED' ? 'bg-blue-100 text-blue-800' :
                                  batch.status === 'DISPATCHED' ? 'bg-yellow-100 text-yellow-800' :
                                  batch.status === 'RECEIVED' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {isExpired ? 'EXPIRED' : batch.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {new Date(batch.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {new Date(batch.expiresAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => viewBatchQR(batch.id)}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  View QR
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* QR Code View */}
            {activeView === 'qr' && qrData && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-6 print:hidden">
                  <h2 className="text-lg font-medium text-gray-900">Batch QR Code</h2>
                  <button 
                    onClick={() => setActiveView('menu')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ← Back
                  </button>
                </div>

                {/* Print-friendly QR display */}
                <div className="text-center print:pt-8">
                  <div className="inline-block p-6 border-2 border-gray-200 rounded-lg">
                    <img 
                      src={qrData.qrCode} 
                      alt="Batch QR Code" 
                      className="mx-auto mb-4"
                    />
                    <div className="text-left space-y-2 border-t pt-4">
                      <p className="text-sm"><strong>Batch ID:</strong> {qrData.batchId.slice(0, 8)}...</p>
                      <p className="text-sm"><strong>Kitchen:</strong> {qrData.kitchenName}</p>
                      <p className="text-sm"><strong>Supplier:</strong> {qrData.supplierName}</p>
                      <p className="text-sm"><strong>Created:</strong> {new Date(qrData.createdAt).toLocaleString()}</p>
                      <p className="text-sm"><strong>Expires:</strong> {new Date(qrData.expiresAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-6 print:hidden">
                    <button
                      onClick={handlePrint}
                      className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 mr-3"
                    >
                      🖨️ Print QR Code
                    </button>
                    <button
                      onClick={() => setActiveView('create')}
                      className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                    >
                      Create Another Batch
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
