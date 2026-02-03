'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface BatchEvent {
  id: string
  eventType: string
  actorRole: string
  createdAt: string
}

interface Kitchen {
  id: string
  name: string
  status: string
}

interface BatchData {
  id: string
  supplierName: string
  status: string
  createdAt: string
  expiresAt: string
  isExpired: boolean
  kitchen: Kitchen
  events: BatchEvent[]
}

export default function ScanBatchPage() {
  const params = useParams()
  const batchId = params.id as string
  
  const [batch, setBatch] = useState<BatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (batchId) {
      fetchBatchInfo()
    }
  }, [batchId])

  const fetchBatchInfo = async () => {
    try {
      const res = await fetch(`/api/batches/${batchId}`)
      const data = await res.json()

      if (res.ok) {
        setBatch(data.batch)
      } else {
        setError(data.error || 'Batch not found')
      }
    } catch (err) {
      setError('Failed to load batch information')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading batch information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Batch Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!batch) return null

  const getStatusColor = (status: string, isExpired: boolean) => {
    if (isExpired) return 'bg-red-100 text-red-800 border-red-200'
    switch (status) {
      case 'CREATED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'DISPATCHED': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'RECEIVED': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string, isExpired: boolean) => {
    if (isExpired) return '⚠️'
    switch (status) {
      case 'CREATED': return '📦'
      case 'DISPATCHED': return '🚚'
      case 'RECEIVED': return '✅'
      default: return '📋'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🍱 Food Batch Information</h1>
          <p className="text-gray-500 text-sm mt-1">Railway Food Safety System</p>
        </div>

        {/* Status Card */}
        <div className={`rounded-xl border-2 p-6 mb-6 ${getStatusColor(batch.status, batch.isExpired)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">Current Status</p>
              <p className="text-2xl font-bold">
                {getStatusIcon(batch.status, batch.isExpired)} {batch.isExpired ? 'EXPIRED' : batch.status}
              </p>
            </div>
            {batch.isExpired && (
              <div className="text-right">
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  ⚠️ EXPIRED
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Batch Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
            📋 Batch Details
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-gray-500">Batch ID</span>
              <span className="text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {batch.id.slice(0, 8)}...
              </span>
            </div>
            
            <div className="flex justify-between items-start">
              <span className="text-gray-500">Kitchen</span>
              <span className="text-gray-900 font-medium">{batch.kitchen.name}</span>
            </div>
            
            <div className="flex justify-between items-start">
              <span className="text-gray-500">Supplier</span>
              <span className="text-gray-900 font-medium">{batch.supplierName}</span>
            </div>
            
            <div className="flex justify-between items-start">
              <span className="text-gray-500">Created</span>
              <span className="text-gray-900">{new Date(batch.createdAt).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-start">
              <span className="text-gray-500">Expires</span>
              <span className={`font-medium ${batch.isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(batch.expiresAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
            📍 Tracking History
          </h2>
          
          <div className="space-y-4">
            {batch.events.map((event, index) => (
              <div key={event.id} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    event.eventType === 'CREATED' ? 'bg-blue-100 text-blue-600' :
                    event.eventType === 'DISPATCHED' ? 'bg-yellow-100 text-yellow-600' :
                    event.eventType === 'RECEIVED' ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {event.eventType === 'CREATED' && '📦'}
                    {event.eventType === 'DISPATCHED' && '🚚'}
                    {event.eventType === 'RECEIVED' && '✅'}
                    {event.eventType === 'COMPLAINT' && '⚠️'}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.eventType}</p>
                  <p className="text-xs text-gray-500">
                    by {event.actorRole} • {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
                {index < batch.events.length - 1 && (
                  <div className="absolute left-4 mt-8 w-0.5 h-6 bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>Railway Food Safety System</p>
          <p>Scanned at {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
