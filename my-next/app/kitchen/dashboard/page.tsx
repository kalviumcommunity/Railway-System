'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface Kitchen {
  id: string
  name: string
  status: string
  createdAt: string
  _count: { batches: number }
}

interface Batch {
  id: string
  supplierName: string
  foodItem: string
  qrCode: string
  status: string
  createdAt: string
  expiresAt: string
  kitchen: { name: string }
}

interface Stats {
  totalKitchens: number
  activeKitchens: number
  totalBatches: number
  activeBatches: number
}

export default function KitchenDashboard() {
  const { user, logout, token } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'kitchens' | 'batches' | 'qr'>('overview')
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [stats, setStats] = useState<Stats>({ totalKitchens: 0, activeKitchens: 0, totalBatches: 0, activeBatches: 0 })
  const [loading, setLoading] = useState(false)

  // Modal states
  const [showKitchenModal, setShowKitchenModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [newKitchenName, setNewKitchenName] = useState('')
  const [newBatch, setNewBatch] = useState({
    kitchenId: '',
    supplierName: '',
    foodItem: '',
    expiresAt: ''
  })

  const loadData = useCallback(async () => {
    if (!token) return
    
    setLoading(true)
    try {
      // Load kitchens
      const kitchensRes = await fetch('/api/admin/kitchens', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      let kitchensData: Kitchen[] = []
      if (kitchensRes.ok) {
        kitchensData = await kitchensRes.json()
        setKitchens(kitchensData)
      }

      // Load batches
      const batchesRes = await fetch('/api/admin/batches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      let batchesData: Batch[] = []
      if (batchesRes.ok) {
        batchesData = await batchesRes.json()
        setBatches(batchesData)
      }

      // Calculate stats from the newly loaded data
      const activeKitchens = kitchensData.filter(k => k.status === 'ACTIVE').length
      const activeBatches = batchesData.filter(b => ['CREATED', 'DISPATCHED'].includes(b.status)).length
      
      setStats({
        totalKitchens: kitchensData.length,
        activeKitchens: activeKitchens,
        totalBatches: batchesData.length,
        activeBatches: activeBatches
      })
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  const createKitchen = async () => {
    if (!newKitchenName.trim()) return
    
    try {
      const res = await fetch('/api/admin/kitchens', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newKitchenName })
      })

      if (res.ok) {
        setShowKitchenModal(false)
        setNewKitchenName('')
        loadData()
        alert('Kitchen created successfully!')
      } else {
        const errorData = await res.json()
        alert(`Failed to create kitchen: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating kitchen:', error)
      alert('Error creating kitchen: Network error')
    }
  }

  const createBatch = async () => {
    if (!newBatch.kitchenId || !newBatch.supplierName || !newBatch.foodItem || !newBatch.expiresAt) {
      alert('Please fill all fields')
      return
    }

    console.log('Creating batch with data:', newBatch)

    try {
      const res = await fetch('/api/admin/batches', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBatch)
      })

      console.log('Response status:', res.status)

      if (res.ok) {
        setShowBatchModal(false)
        setNewBatch({ kitchenId: '', supplierName: '', foodItem: '', expiresAt: '' })
        loadData()
        alert('Batch created successfully!')
      } else {
        const errorData = await res.json()
        console.error('Error response:', errorData)
        alert(`Failed to create batch: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating batch:', error)
      alert('Error creating batch: Network error')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['KITCHEN']}>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Kitchen Head Dashboard
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

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'kitchens', label: 'Kitchens' },
                { id: 'batches', label: 'Batches' },
                { id: 'qr', label: 'QR Codes' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-500">Total Kitchens</div>
                    <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalKitchens}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-500">Active Kitchens</div>
                    <div className="mt-2 text-3xl font-semibold text-green-600">{stats.activeKitchens}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-500">Total Batches</div>
                    <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalBatches}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-500">Active Batches</div>
                    <div className="mt-2 text-3xl font-semibold text-blue-600">{stats.activeBatches}</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => {
                        setShowKitchenModal(true)
                        setActiveTab('kitchens')
                      }}
                      className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-center"
                    >
                      Create Kitchen
                    </button>
                    <button
                      onClick={() => {
                        setShowBatchModal(true)
                        setActiveTab('batches')
                      }}
                      className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium text-center"
                    >
                      Create Batch
                    </button>
                    <button
                      onClick={() => setActiveTab('qr')}
                      className="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium text-center"
                    >
                      Generate QR Code
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Batches</h2>
                  <div className="space-y-3">
                    {batches.slice(0, 5).map(batch => (
                      <div key={batch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <div className="font-medium">{batch.supplierName}</div>
                          <div className="text-sm text-gray-500">{batch.kitchen.name}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          batch.status === 'CREATED' ? 'bg-yellow-100 text-yellow-800' :
                          batch.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-800' :
                          batch.status === 'RECEIVED' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {batch.status}
                        </span>
                      </div>
                    ))}
                    {batches.length === 0 && (
                      <div className="text-center text-gray-500 py-4">No batches yet</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Kitchens Tab */}
            {activeTab === 'kitchens' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Kitchen Management</h2>
                  <button
                    onClick={() => setShowKitchenModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                  >
                    + Create Kitchen
                  </button>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batches</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {kitchens.map(kitchen => (
                        <tr key={kitchen.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{kitchen.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              kitchen.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {kitchen.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {kitchen._count?.batches || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(kitchen.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                            <button className="text-gray-600 hover:text-gray-900">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {kitchens.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No kitchens found. Create your first kitchen!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Batches Tab */}
            {activeTab === 'batches' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Batch Management</h2>
                  <button
                    onClick={() => setShowBatchModal(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
                  >
                    + Create Batch
                  </button>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Food Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kitchen</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {batches.map(batch => (
                        <tr key={batch.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{batch.supplierName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {batch.foodItem}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {batch.kitchen.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              batch.status === 'CREATED' ? 'bg-yellow-100 text-yellow-800' :
                              batch.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-800' :
                              batch.status === 'RECEIVED' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {batch.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">{batch.qrCode || 'N/A'}</code>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(batch.expiresAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button 
                              onClick={() => {
                                setSelectedBatch(batch)
                                setShowQRModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              View QR
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">Details</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {batches.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No batches found. Create your first batch!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR Codes Tab */}
            {activeTab === 'qr' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">QR Code Generator</h2>
                
                <div className="bg-white shadow rounded-lg p-6">
                  <p className="text-gray-600 mb-4">
                    Generate QR codes for batch tracking and verification
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Batch
                      </label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="">Choose a batch...</option>
                        {batches.filter(b => b.status === 'CREATED').map(batch => (
                          <option key={batch.id} value={batch.id}>
                            {batch.supplierName} - {batch.kitchen.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium">
                      Generate QR Code
                    </button>

                    <div className="mt-6 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">QR code will appear here</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Kitchen Modal */}
        {showKitchenModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Kitchen</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kitchen Name
                  </label>
                  <input
                    type="text"
                    value={newKitchenName}
                    onChange={(e) => setNewKitchenName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter kitchen name"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={createKitchen}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowKitchenModal(false)
                      setNewKitchenName('')
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Batch Modal */}
        {showBatchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Batch</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kitchen
                  </label>
                  <select
                    value={newBatch.kitchenId}
                    onChange={(e) => setNewBatch({...newBatch, kitchenId: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select kitchen...</option>
                    {kitchens.filter(k => k.status === 'ACTIVE').map(kitchen => (
                      <option key={kitchen.id} value={kitchen.id}>{kitchen.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    value={newBatch.supplierName}
                    onChange={(e) => setNewBatch({...newBatch, supplierName: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter supplier name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Item
                  </label>
                  <input
                    type="text"
                    value={newBatch.foodItem}
                    onChange={(e) => setNewBatch({...newBatch, foodItem: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter food item name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newBatch.expiresAt}
                    onChange={(e) => setNewBatch({...newBatch, expiresAt: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={createBatch}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowBatchModal(false)
                      setNewBatch({ kitchenId: '', supplierName: '', foodItem: '', expiresAt: '' })
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code View Modal */}
        {showQRModal && selectedBatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Batch QR Code</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Supplier</p>
                      <p className="font-medium">{selectedBatch.supplierName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Food Item</p>
                      <p className="font-medium">{selectedBatch.foodItem}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Kitchen</p>
                      <p className="font-medium">{selectedBatch.kitchen.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">{selectedBatch.status}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 mb-2">QR Code</p>
                    <div className="bg-white p-6 rounded border-2 border-gray-300 flex flex-col items-center">
                      <div id="qr-code-svg">
                        <QRCodeSVG 
                          value={`${window.location.origin}/complaint/${selectedBatch.qrCode}`}
                          size={200}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <div className="mt-4 font-mono text-sm text-gray-600 break-all text-center">
                        {selectedBatch.qrCode}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Scan this QR code to track or report issues
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    <p><strong>Created:</strong> {new Date(selectedBatch.createdAt).toLocaleString()}</p>
                    <p><strong>Expires:</strong> {new Date(selectedBatch.expiresAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/complaint/${selectedBatch.qrCode}`)
                      alert('Complaint link copied to clipboard!')
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => {
                      const svg = document.getElementById('qr-code-svg')
                      if (svg) {
                        const svgData = new XMLSerializer().serializeToString(svg)
                        const canvas = document.createElement('canvas')
                        const ctx = canvas.getContext('2d')
                        const img = new Image()
                        img.onload = () => {
                          canvas.width = img.width
                          canvas.height = img.height
                          ctx?.drawImage(img, 0, 0)
                          const pngFile = canvas.toDataURL('image/png')
                          const downloadLink = document.createElement('a')
                          downloadLink.download = `QR-${selectedBatch.qrCode}.png`
                          downloadLink.href = pngFile
                          downloadLink.click()
                        }
                        img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
                  >
                    Download QR
                  </button>
                  <button
                    onClick={() => {
                      setShowQRModal(false)
                      setSelectedBatch(null)
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
