'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
  active: boolean
  createdAt: string
}

interface Kitchen {
  id: string
  name: string
  status: string
  createdAt: string
  batches: Array<{ id: string; status: string }>
  _count: { batches: number }
}

interface Batch {
  id: string
  supplierName: string
  status: string
  createdAt: string
  expiresAt: string
  kitchen: { name: string; status?: string }
  _count: { complaints: number }
}

interface Complaint {
  id: string
  trainNo: string
  message: string
  createdAt: string
  batch: {
    id: string
    supplierName: string
    kitchen: { name: string }
  }
}

interface Stats {
  users: { total: number; active: number }
  kitchens: { total: number; active: number }
  batches: { total: number; active: number }
  complaints: number
}

interface Activity {
  id: string
  eventType: string
  actorRole: string
  createdAt: string
  batch: {
    id: string
    supplierName: string
    kitchen: { name: string }
  }
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'kitchens' | 'batches' | 'complaints'>('overview')
  const [newKitchenName, setNewKitchenName] = useState('')

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const [usersRes, kitchensRes, batchesRes, complaintsRes, statsRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/kitchens', { headers }),
        fetch('/api/admin/batches', { headers }),
        fetch('/api/admin/complaints', { headers }),
        fetch('/api/admin/stats', { headers }),
      ])

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users || data)
      }
      
      if (kitchensRes.ok) {
        const data = await kitchensRes.json()
        setKitchens(data.kitchens || data)
      }
      
      if (batchesRes.ok) {
        const data = await batchesRes.json()
        setBatches(Array.isArray(data) ? data : (data.batches || []))
      }
      
      if (complaintsRes.ok) {
        const data = await complaintsRes.json()
        setComplaints(data.complaints || data)
      }
      
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
        setRecentActivity(data.recentActivity)
      }
    } catch (error) {
      setError('Error loading data')
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleKitchenStatus = async (kitchenId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/kitchens/${kitchenId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchAllData()
      }
    } catch (error) {
      console.error('Error updating kitchen:', error)
    }
  }

  const toggleUserStatus = async (userId: string, currentActive: boolean) => {
    try {
      const newActive = !currentActive
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: newActive }),
      })

      if (response.ok) {
        fetchAllData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user status')
    }
  }

  const createKitchen = async () => {
    if (!newKitchenName.trim()) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/kitchens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKitchenName }),
      })

      if (response.ok) {
        setNewKitchenName('')
        fetchAllData()
      }
    } catch (error) {
      console.error('Error creating kitchen:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'RECEIVED':
        return 'bg-green-100 text-green-800'
      case 'BLOCKED':
      case 'EXPIRED':
        return 'bg-red-100 text-red-800'
      case 'DISPATCHED':
        return 'bg-blue-100 text-blue-800'
      case 'CREATED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Railway System - Admin Control Panel
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {user?.name} ({user?.role})
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8 overflow-x-auto">
              <button
                onClick={() => setActiveView('overview')}
                className={`py-4 border-b-2 text-sm font-medium whitespace-nowrap ${
                  activeView === 'overview'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('kitchens')}
                className={`py-4 border-b-2 text-sm font-medium whitespace-nowrap ${
                  activeView === 'kitchens'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Kitchen Management
              </button>
              <button
                onClick={() => setActiveView('batches')}
                className={`py-4 border-b-2 text-sm font-medium whitespace-nowrap ${
                  activeView === 'batches'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Batch Tracking
              </button>
              <button
                onClick={() => setActiveView('complaints')}
                className={`py-4 border-b-2 text-sm font-medium whitespace-nowrap ${
                  activeView === 'complaints'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Complaints
              </button>
              <button
                onClick={() => setActiveView('users')}
                className={`py-4 border-b-2 text-sm font-medium whitespace-nowrap ${
                  activeView === 'users'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                User Management
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
              {error}
            </div>
          ) : (
            <>
              {/* OVERVIEW VIEW */}
              {activeView === 'overview' && stats && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="text-sm text-gray-600 mb-1">Total Users</div>
                      <div className="text-3xl font-semibold text-gray-900">{stats.users.total}</div>
                      <div className="text-xs text-gray-500 mt-1">{stats.users.active} active</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="text-sm text-gray-600 mb-1">Active Kitchens</div>
                      <div className="text-3xl font-semibold text-gray-900">{stats.kitchens.active}</div>
                      <div className="text-xs text-gray-500 mt-1">{stats.kitchens.total} total</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="text-sm text-gray-600 mb-1">Active Batches</div>
                      <div className="text-3xl font-semibold text-gray-900">{stats.batches.active}</div>
                      <div className="text-xs text-gray-500 mt-1">{stats.batches.total} total</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="text-sm text-gray-600 mb-1">Total Complaints</div>
                      <div className="text-3xl font-semibold text-gray-900">{stats.complaints}</div>
                      <div className="text-xs text-gray-500 mt-1">Requires attention</div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                      <button
                        onClick={fetchAllData}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Refresh
                      </button>
                    </div>
                    <div className="space-y-3">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {activity.eventType} - {activity.batch.kitchen.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              Supplier: {activity.batch.supplierName} | By: {activity.actorRole}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(activity.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                      {recentActivity.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No recent activity</div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Controls</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => setActiveView('kitchens')}
                          className="w-full px-4 py-3 text-left border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <div className="font-medium text-gray-900">Manage Kitchens</div>
                          <div className="text-sm text-gray-600">Control kitchen operations and status</div>
                        </button>
                        <button
                          onClick={() => setActiveView('batches')}
                          className="w-full px-4 py-3 text-left border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <div className="font-medium text-gray-900">Track Batches</div>
                          <div className="text-sm text-gray-600">Monitor all batch movements</div>
                        </button>
                        <button
                          onClick={() => setActiveView('complaints')}
                          className="w-full px-4 py-3 text-left border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <div className="font-medium text-gray-900">View Complaints</div>
                          <div className="text-sm text-gray-600">Review and manage complaints</div>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Kitchen Staff</span>
                          <span className="text-sm font-medium text-gray-900">
                            {users.filter(u => u.role === 'KITCHEN').length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Pantry Staff</span>
                          <span className="text-sm font-medium text-gray-900">
                            {users.filter(u => u.role === 'PANTRY').length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Pending Batches</span>
                          <span className="text-sm font-medium text-gray-900">
                            {batches.filter(b => b.status === 'CREATED' || b.status === 'DISPATCHED').length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">Blocked Kitchens</span>
                          <span className="text-sm font-medium text-red-700">
                            {kitchens.filter(k => k.status === 'BLOCKED').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* KITCHENS VIEW */}
              {activeView === 'kitchens' && (
                <div className="space-y-6">
                  {/* Create New Kitchen */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Kitchen</h2>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newKitchenName}
                        onChange={(e) => setNewKitchenName(e.target.value)}
                        placeholder="Enter kitchen name"
                        className="flex-1 px-3 py-2.5 border-2 border-gray-300 bg-white rounded text-gray-900 font-medium text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 shadow-sm"
                        onKeyPress={(e) => e.key === 'Enter' && createKitchen()}
                      />
                      <button
                        onClick={createKitchen}
                        className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                      >
                        Create Kitchen
                      </button>
                    </div>
                  </div>

                  {/* Kitchens List */}
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">All Kitchens</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kitchen Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Total Batches</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {kitchens.map((kitchen) => (
                            <tr key={kitchen.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{kitchen.name}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(kitchen.status)}`}>
                                  {kitchen.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{kitchen._count.batches}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(kitchen.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <button
                                  onClick={() => toggleKitchenStatus(kitchen.id, kitchen.status)}
                                  className={`px-3 py-1 text-xs border rounded hover:bg-gray-50 ${
                                    kitchen.status === 'ACTIVE' 
                                      ? 'border-red-300 text-red-700' 
                                      : 'border-green-300 text-green-700'
                                  }`}
                                >
                                  {kitchen.status === 'ACTIVE' ? 'Block' : 'Activate'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {kitchens.length === 0 && (
                      <div className="text-center py-12 text-gray-500">No kitchens found</div>
                    )}
                  </div>
                </div>
              )}

              {/* BATCHES VIEW */}
              {activeView === 'batches' && (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-900">All Batches</h2>
                      <button
                        onClick={fetchAllData}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Batch ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Kitchen</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Supplier</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Complaints</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Expires</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {batches.map((batch) => {
                          const isBlockedKitchen = batch.kitchen.status === 'BLOCKED'
                          return (
                            <tr key={batch.id} className={`hover:bg-gray-50 ${isBlockedKitchen ? 'bg-red-50/30' : ''}`}>
                              <td className="px-6 py-4 text-sm font-mono text-gray-600">{batch.id.slice(0, 8)}...</td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{batch.kitchen.name}</span>
                                  {isBlockedKitchen && (
                                    <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                                      BLOCKED
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{batch.supplierName}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(batch.status)}`}>
                                  {batch.status}
                                </span>
                              </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                batch._count.complaints > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {batch._count.complaints}
                              </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(batch.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(batch.expiresAt).toLocaleDateString()}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  {batches.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No batches found</div>
                  )}
                </div>
              )}

              {/* COMPLAINTS VIEW */}
              {activeView === 'complaints' && (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-900">All Complaints</h2>
                      <div className="text-sm text-gray-600">Total: {complaints.length}</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {complaints.map((complaint) => (
                      <div key={complaint.id} className="p-6 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Train No: {complaint.trainNo}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Kitchen: {complaint.batch.kitchen.name} | Supplier: {complaint.batch.supplierName}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(complaint.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                          {complaint.message}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Batch ID: {complaint.batch.id.slice(0, 8)}...
                        </div>
                      </div>
                    ))}
                    {complaints.length === 0 && (
                      <div className="text-center py-12 text-gray-500">No complaints found</div>
                    )}
                  </div>
                </div>
              )}

              {/* USERS VIEW */}
              {activeView === 'users' && (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
                      <button
                        onClick={fetchAllData}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {u.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {u.id !== user?.userId && (
                                <button
                                  onClick={() => toggleUserStatus(u.id, u.active)}
                                  className={`px-3 py-1 text-xs border rounded hover:bg-gray-50 ${
                                    u.active
                                      ? 'border-red-300 text-red-700'
                                      : 'border-green-300 text-green-700'
                                  }`}
                                >
                                  {u.active ? 'Block' : 'Activate'}
                                </button>
                              )}
                              {u.id === user?.userId && (
                                <span className="text-xs text-gray-400 italic">You</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {users.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
