'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Batch {
  id: string
  supplierName: string
  foodItem: string
  status: string
  expiresAt: string
  kitchen: { name: string }
}

export default function ComplaintPage() {
  const params = useParams()
  const router = useRouter()
  const qrcode = params.qrcode as string

  const [batch, setBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    trainNo: '',
    passengerName: '',
    message: ''
  })

  useEffect(() => {
    loadBatchInfo()
  }, [qrcode])

  const loadBatchInfo = async () => {
    try {
      const res = await fetch(`/api/public/batch/${qrcode}`)
      if (res.ok) {
        const data = await res.json()
        setBatch(data)
      } else {
        console.error('Batch not found')
      }
    } catch (error) {
      console.error('Error loading batch:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitComplaint = async () => {
    if (!formData.trainNo || !formData.message) {
      alert('Please enter train number and your complaint')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/public/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode: qrcode,
          trainNo: formData.trainNo,
          passengerName: formData.passengerName,
          message: formData.message
        })
      })

      if (res.ok) {
        setSubmitted(true)
        alert('Complaint submitted successfully! Thank you for your feedback.')
      } else {
        const error = await res.json()
        alert(`Failed to submit complaint: ${error.error}`)
      }
    } catch (error) {
      alert('Error submitting complaint. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid QR Code</h1>
          <p className="text-gray-600 mb-4">
            The QR code you scanned is not valid or the batch does not exist.
          </p>
          <p className="text-sm text-gray-500">
            QR Code: <code className="bg-gray-100 px-2 py-1 rounded">{qrcode}</code>
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your complaint has been submitted successfully. Our team will review it shortly.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const isExpired = new Date(batch.expiresAt) < new Date()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚂 Railway Food Service</h1>
          <p className="text-gray-600">Passenger Feedback Portal</p>
        </div>

        {/* Batch Information Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Food Batch Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Food Item</p>
              <p className="font-medium text-lg">{batch.foodItem}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Supplier</p>
              <p className="font-medium">{batch.supplierName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Kitchen</p>
              <p className="font-medium">{batch.kitchen.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                batch.status === 'CREATED' ? 'bg-yellow-100 text-yellow-800' :
                batch.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-800' :
                batch.status === 'RECEIVED' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {batch.status}
              </span>
            </div>
          </div>
          {isExpired && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                ⚠️ <strong>Warning:</strong> This batch has expired. Please do not consume and report it immediately.
              </p>
            </div>
          )}
        </div>

        {/* Complaint Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Submit a Complaint</h2>
          <p className="text-gray-600 mb-6">
            Have an issue with your food? Let us know and we'll address it promptly.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Train Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.trainNo}
                onChange={(e) => setFormData({...formData, trainNo: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 12345"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passenger Name (Optional)
              </label>
              <input
                type="text"
                value={formData.passengerName}
                onChange={(e) => setFormData({...formData, passengerName: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complaint Details <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-4 py-2 h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please describe your complaint in detail..."
                required
              />
            </div>

            <button
              onClick={submitComplaint}
              disabled={submitting}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md font-medium text-lg transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Your complaint will be reviewed by our team. Thank you for helping us improve our service.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Indian Railways Food Service</p>
          <p className="mt-1">For immediate assistance, contact: 139 (Railway Helpline)</p>
        </div>
      </div>
    </div>
  )
}
