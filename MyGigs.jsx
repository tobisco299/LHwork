import { useState, useEffect } from 'react'

const MyGigs = () => {
  const [myGigs, setMyGigs] = useState({ posted: [], accepted: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch user's gigs from backend
    const fetchMyGigs = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        const response = await fetch(`${API_BASE}/api/gigs/my-gigs`)
        const data = await response.json()
        setMyGigs(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching my gigs:', error)
        setLoading(false)
      }
    }

    fetchMyGigs()
  }, [])

  const handleComplete = async (gigId) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      await fetch(`${API_BASE}/api/gigs/${gigId}/complete`, {
        method: 'POST'
      })
      // Refresh gigs list
      window.location.reload()
    } catch (error) {
      console.error('Error completing gig:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Gigs</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Gigs I Posted</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myGigs.posted.map((gig) => (
              <div key={gig._id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">{gig.title}</h3>
                <p className="text-gray-600 mb-4">{gig.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-medium">
                    {gig.paymentAmount} XLM
                  </span>
                  {gig.status === 'in-progress' && (
                    <button
                      onClick={() => handleComplete(gig._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Gigs I Accepted</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myGigs.accepted.map((gig) => (
              <div key={gig._id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">{gig.title}</h3>
                <p className="text-gray-600 mb-4">{gig.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-medium">
                    {gig.paymentAmount} XLM
                  </span>
                  <span className="text-gray-500">
                    Status: {gig.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default MyGigs