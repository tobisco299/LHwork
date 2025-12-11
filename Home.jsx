import { useState, useEffect } from 'react'

const Home = () => {
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        const response = await fetch(`${API_BASE}/api/gigs`)
        const data = await response.json()
        setGigs(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching gigs:', error)
        setLoading(false)
      }
    }

    fetchGigs()
  }, [])

  const filteredGigs = filter === 'all' ? gigs : gigs.filter(g => g.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg w-64"></div>
          <div className="h-64 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-lg w-64"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 py-12">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-pulse">
            🚀 Available Opportunities
          </h1>
          <p className="text-xl text-indigo-200 mb-8">
            Discover amazing skills to acquire or showcase your talents
          </p>

          {/* Filter Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            {['all', 'open', 'in-progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  filter === status
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Gigs Grid */}
        {filteredGigs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-xl text-indigo-200">No gigs found in this category. Be the first to post one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGigs.map((gig, index) => (
              <div
                key={gig._id}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-6 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    gig.status === 'open'
                      ? 'bg-green-500/80 text-white'
                      : gig.status === 'in-progress'
                      ? 'bg-yellow-500/80 text-white'
                      : 'bg-gray-500/80 text-white'
                  }`}>
                    {gig.status?.toUpperCase() || 'OPEN'}
                  </span>
                </div>

                {/* Gig Content */}
                <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                  {gig.title}
                </h2>
                <p className="text-indigo-200 mb-4 line-clamp-3 text-sm">
                  {gig.description}
                </p>

                {/* Client Info */}
                <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-indigo-300 font-semibold">Client</p>
                  <p className="text-xs text-gray-300 truncate font-mono">
                    {gig.clientAddress?.slice(0, 16)}...
                  </p>
                </div>

                {/* Payment Amount */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-indigo-300 font-semibold">Reward</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {gig.paymentAmount} XLM
                    </p>
                  </div>
                  <div className="text-4xl">🎁</div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={async () => {
                    const publicKey = localStorage.getItem('publicKey')
                    if (!publicKey) return alert('🔐 Connect your Freighter wallet first!')
                    try {
                      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
                      const res = await fetch(`${API_BASE}/api/gigs/${gig._id}/accept`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ workerAddress: publicKey })
                      })
                      if (res.ok) {
                        const newGigs = await (await fetch(`${API_BASE}/api/gigs`)).json()
                        setGigs(newGigs)
                        alert('✅ Gig accepted! You\'re now the worker.')
                      } else {
                        const err = await res.json()
                        alert('❌ Accept failed: ' + (err.message || JSON.stringify(err)))
                      }
                    } catch (e) {
                      console.error(e)
                      alert('❌ Network error while accepting gig')
                    }
                  }}
                  disabled={gig.status !== 'open'}
                  className={`w-full py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                    gig.status === 'open'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:from-green-600 hover:to-emerald-600'
                      : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {gig.status === 'open' ? '✨ Apply Now' : `⏸️ ${gig.status === 'in-progress' ? 'In Progress' : 'Completed'}`}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home