'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function ScanPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [manualCode, setManualCode] = useState('')
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }

  useEffect(() => {
    // Load jsQR library from CDN
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      stopScanning()
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setScanning(true)
        
        // Start scanning loop
        scanIntervalRef.current = setInterval(scanQRCode, 500)
      }
    } catch (err) {
      setError('Unable to access camera. Please ensure camera permissions are granted.')
      console.error('Camera error:', err)
    }
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // Simple QR code detection using jsQR (loaded via CDN)
    interface WindowWithJsQR extends Window {
      jsQR?: (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null
    }
    
    const win = window as unknown as WindowWithJsQR
    if (typeof window !== 'undefined' && win.jsQR) {
      const code = win.jsQR(imageData.data, imageData.width, imageData.height)
      if (code) {
        handleQRCodeDetected(code.data)
      }
    }
  }

  const handleQRCodeDetected = (qrCode: string) => {
    stopScanning()
    // Navigate to complaint page with the QR code
    router.push(`/complaint/${qrCode}`)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      router.push(`/complaint/${manualCode.trim()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan QR Code</h1>
            <p className="text-gray-600">
              Scan the QR code on your food package to report any complaints
            </p>
          </div>

          {/* Scanner Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            {!scanning ? (
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="w-32 h-32 mx-auto text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <button
                  onClick={startScanning}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Start Camera
                </button>
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="relative rounded-lg overflow-hidden bg-black mb-4">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover"
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-4 border-white w-48 h-48 rounded-lg opacity-50"></div>
                  </div>
                </div>
                
                <button
                  onClick={stopScanning}
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Stop Camera
                </button>
                
                <p className="text-center text-sm text-gray-600 mt-3">
                  Position the QR code within the frame
                </p>
              </div>
            )}
          </div>

          {/* Manual Entry Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Or Enter Code Manually
            </h2>
            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter QR code"
                className="w-full px-4 py-2.5 border-2 border-gray-300 bg-white rounded-lg mb-3 text-gray-900 font-medium text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              />
              <button
                type="submit"
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Submit Code
              </button>
            </form>
          </div>

          {/* Back Button */}
          <button
            onClick={() => router.push('/')}
            className="w-full mt-4 bg-white text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
  )
}
