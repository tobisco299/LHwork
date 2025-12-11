import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PostGig = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    paymentAmount: '',
    workerAddress: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const publicKey = localStorage.getItem('publicKey') || ''
      const payload = { ...formData, clientAddress: publicKey }

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const response = await fetch(`${API_BASE}/api/gigs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => navigate('/'), 2000)
      }
    } catch (error) {
      console.error('Error posting gig:', error)
      alert('❌ Failed to post gig')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const isConnected = localStorage.getItem('publicKey')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              ✨ Create Your Gig
            </h1>
            <p className="text-indigo-200">Share your skills and get discovered by amazing clients</p>
          </div>

          {/* Success Message */}
          {submitted && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center space-x-3">
                <div className="text-3xl animate-bounce">✅</div>
                <div>
                  <p className="text-xl font-bold text-green-300">Gig Posted Successfully!</p>
                  <p className="text-green-200">Redirecting to home...</p>
                </div>
              </div>
            </div>
          )}

          {/* Warning Banner */}
          {!isConnected && (
            <div className="mb-8 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl backdrop-blur-xl">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-yellow-200">Connect Your Wallet First!</p>
                  <p className="text-sm text-yellow-100">Visit the Wallet page to connect Freighter. Your public key will be attached as the client address.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-semibold text-indigo-200 mb-3">
                📝 Gig Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Fix React Component Bug"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-semibold text-indigo-200 mb-3">
                📖 Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what needs to be done, expected outcomes, and any requirements..."
                rows="5"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                required
                disabled={loading}
              />
            </div>

            {/* Payment Amount Field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-indigo-200 mb-3">
                  💰 Payment Amount (XLM)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="paymentAmount"
                    value={formData.paymentAmount}
                    onChange={handleChange}
                    placeholder="100"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                    disabled={loading}
                    min="1"
                  />
                  <span className="absolute right-4 top-3 text-gray-400">XLM</span>
                </div>
              </div>

              {/* Worker Address Field */}
              <div>
                <label className="block text-sm font-semibold text-indigo-200 mb-3">
                  🎯 Target Worker (Optional)
                </label>
                <input
                  type="text"
                  name="workerAddress"
                  value={formData.workerAddress}
                  onChange={handleChange}
                  placeholder="Stellar address or leave empty"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-xs font-mono"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Client Info Display */}
            {isConnected && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-xs text-indigo-300 font-semibold mb-2">Your Wallet Address (Client)</p>
                <p className="text-xs text-gray-300 font-mono truncate">
                  {localStorage.getItem('publicKey')}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isConnected}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                loading || !isConnected
                  ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-2xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin">⏳</div>
                  <span>Publishing Gig...</span>
                </span>
              ) : (
                <span>🚀 Publish Gig</span>
              )}
            </button>

            {/* Info Text */}
            <p className="text-center text-xs text-gray-400">
              Your gig will be posted to the blockchain and available for workers to discover
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostGig