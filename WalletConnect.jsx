import { useState, useEffect } from 'react'

const WalletConnect = () => {
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState('')
  const [reputation, setReputation] = useState(0)
  const [loading, setLoading] = useState(true)
  // Missing states which were referenced in the component and caused a runtime error
  const [freighterInstalled, setFreighterInstalled] = useState(false)
  const [lastError, setLastError] = useState('')
  const [debugInfo, setDebugInfo] = useState(null)

  // Helper to find the injected Freighter object under a few possible names
  const getFreighter = () => {
    // Common injection names across versions or alternative injectors
    if (typeof window !== 'undefined') {
      if (window.freighter) return window.freighter
      if (window.freighterApi) return window.freighterApi
      if (window.freighterProvider) return window.freighterProvider
      if (window.stellar && window.stellar.freighter) return window.stellar.freighter
    }
    return undefined
  }

  useEffect(() => {
    checkWalletConnection()

    // Poll for Freighter injection for a short period in case the extension
    // injects after the page has loaded. This makes the connect button
    // become enabled without a page refresh.
    let attempts = 0
    const maxAttempts = 50
    const interval = setInterval(() => {
      attempts += 1
      if (getFreighter()) {
        clearInterval(interval)
        checkWalletConnection()
      } else if (attempts >= maxAttempts) {
        clearInterval(interval)
        setLoading(false)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [])

  const checkWalletConnection = async () => {
    const freighter = getFreighter()
    if (freighter) {
      setFreighterInstalled(true)
      try {
        console.debug('Freighter object detected:', Object.keys(freighter || {}))
        const publicKey = await freighter.getPublicKey()
        setConnected(true)
        setPublicKey(publicKey)
        try { localStorage.setItem('publicKey', publicKey) } catch (e) {}
        await fetchReputation(publicKey)
      } catch (e) {
        console.error('Not connected to Freighter', e)
        setLastError(String(e))
        setConnected(false)
      }
    } else {
      setFreighterInstalled(false)
    }
    setLoading(false)
  }

  const connectWallet = async () => {
    const freighter = getFreighter()
    if (!freighter) {
      // If Freighter is not detected, open install page to help the user
      window.open('https://www.freighter.app/', '_blank')
      return
    }

    try {
      // Try to get the public key first (if already connected)
      let publicKey = null
      try {
        if (typeof freighter.getPublicKey === 'function') {
          const pk = await freighter.getPublicKey()
          if (pk) publicKey = pk
        }
      } catch (e) {
        console.debug('getPublicKey initial attempt failed', e)
      }

      // If not available, attempt an explicit connect which should prompt the extension
      if (!publicKey) {
        try {
          if (typeof freighter.connect === 'function') {
            await freighter.connect()
          }
        } catch (e) {
          console.debug('freighter.connect() failed or was dismissed', e)
        }

        // After connect attempt, try several ways to obtain the account
        try {
          if (typeof freighter.getPublicKey === 'function') {
            const pk = await freighter.getPublicKey()
            if (pk) publicKey = pk
          }
        } catch (e) {
          console.debug('getPublicKey after connect failed', e)
        }

        // Some Freighter versions expose getAccount
        if (!publicKey && typeof freighter.getAccount === 'function') {
          try {
            const acct = await freighter.getAccount()
            if (acct && acct.accountId) publicKey = acct.accountId
          } catch (e) {
            console.debug('getAccount failed', e)
          }
        }
      }

      if (!publicKey) {
        // Give the user clear instructions to allow the connection in the extension
        alert('Unable to connect to Freighter. Please open the Freighter extension, unlock your wallet, and allow connection to this site, then click Connect again.')
        console.error('Freighter detected but no public key could be obtained')
        return
      }

      setConnected(true)
      setPublicKey(publicKey)
      try { localStorage.setItem('publicKey', publicKey) } catch (e) {}
      await fetchReputation(publicKey)
    } catch (e) {
      console.error('Unexpected error while connecting to Freighter:', e)
      setLastError(String(e))
      alert('Error connecting to Freighter. Check the console for details.')
    }
  }

  const disconnectWallet = () => {
    setConnected(false)
    setPublicKey('')
    setReputation(0)
    try { localStorage.removeItem('publicKey') } catch (e) {} 
  }

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const fetchReputation = async (address) => {
    try {
      const response = await fetch(`${API_BASE}/api/users/${address}/reputation`)
      const data = await response.json()
      setReputation(data.reputation || 0)
    } catch (error) {
      console.error('Error fetching reputation:', error)
      setReputation(0)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg w-64"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              💰 Your Wallet
            </h1>
            <p className="text-indigo-200">Manage your Stellar account and reputation</p>
          </div>

          {!connected ? (
            // Not Connected State
            <div className="space-y-6">
              {/* Main CTA Card */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-6 animate-bounce">🔓</div>
                <h2 className="text-3xl font-bold text-white mb-3">Connect Your Wallet</h2>
                <p className="text-indigo-200 mb-8 text-lg">
                  Connect your Stellar wallet to post gigs, accept work, and build your reputation on the B-SEN network.
                </p>
                <button
                    onClick={connectWallet}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-4 px-8 rounded-lg font-bold text-lg hover:shadow-2xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                >
                  🔗 Connect Freighter
                </button>
                  {/* If Freighter is installed but user couldn't connect via extension menu,
                      show a small retry/detect hint so they can attempt again. */}
                  {freighterInstalled && !connected && (
                    <div className="mt-4 text-sm text-indigo-200">
                      <p>If you opened Freighter from the browser menu, please unlock it and press Connect here.</p>
                      <button
                        onClick={async () => {
                          setLoading(true)
                          await checkWalletConnection()
                          setLoading(false)
                        }}
                        className="mt-2 inline-block bg-white/10 hover:bg-white/20 text-indigo-200 py-1 px-3 rounded-md"
                      >
                        Retry Detect
                      </button>
                    </div>
                  )}
                <p className="mt-6 text-gray-400 text-sm">
                  This is a secure, decentralized connection. We never access your funds.
                </p>
                {/* Debug tools */}
                <div className="mt-4 text-left text-xs text-indigo-200">
                  <button
                    onClick={async () => {
                      // Gather debug info about the injected wallet
                      const freighter = getFreighter()
                      const info = { present: !!freighter }
                      if (info.present) {
                        try {
                          info.keys = Object.keys(freighter).sort()
                        } catch (e) {
                          info.keysError = String(e)
                        }
                        try {
                          if (typeof freighter.getPublicKey === 'function') {
                            info.publicKey = await freighter.getPublicKey()
                          }
                        } catch (e) {
                          info.getPublicKeyError = String(e)
                        }
                        try {
                          if (typeof freighter.getAccount === 'function') {
                            const acct = await freighter.getAccount()
                            info.getAccount = acct
                          }
                        } catch (e) {
                          info.getAccountError = String(e)
                        }
                      }
                      setDebugInfo(info)
                    }}
                    className="mt-3 inline-block bg-white/10 hover:bg-white/20 text-indigo-200 py-1 px-3 rounded-md mr-2"
                  >
                    Show Freighter Info
                  </button>

                  <button
                    onClick={() => {
                      setLastError('')
                      checkWalletConnection()
                    }}
                    className="mt-3 inline-block bg-white/10 hover:bg-white/20 text-indigo-200 py-1 px-3 rounded-md"
                  >
                    Retry Connect
                  </button>

                  {lastError && (
                    <div className="mt-2 text-rose-300">
                      <strong>Error:</strong> {lastError}
                    </div>
                  )}

                  {debugInfo && (
                    <pre className="mt-2 p-2 bg-black/20 rounded text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
                  )}
                </div>
              </div>
              {/* Show Install Freighter Card only if not installed */}
              {!freighterInstalled && (
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">📦</div>
                    <div>
                      <h3 className="font-bold text-white mb-2">Don't have Freighter?</h3>
                      <p className="text-blue-200 text-sm mb-4">
                        Freighter is a secure browser wallet for the Stellar blockchain.
                      </p>
                      <a
                        href="https://www.freighter.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-all hover:scale-105"
                      >
                        Install Freighter →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Connected State
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-400/50 rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl animate-bounce">✅</div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-300">Connected Successfully!</h2>
                    <p className="text-green-200">Your wallet is ready to use</p>
                  </div>
                </div>
              </div>

              {/* Wallet Address Card */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">📍</span>
                    <h3 className="text-lg font-bold text-indigo-200">Your Stellar Address</h3>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <p className="text-white font-mono text-sm break-all">
                      {publicKey}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publicKey)
                      alert('✅ Address copied to clipboard!')
                    }}
                    className="mt-3 text-xs bg-white/10 hover:bg-white/20 text-indigo-200 py-2 px-4 rounded-lg transition-all"
                  >
                    📋 Copy Address
                  </button>
                </div>
              </div>

              {/* Reputation Card */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-400/30 rounded-2xl p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">⭐</span>
                      <h3 className="text-lg font-bold text-yellow-200">Your Reputation Score</h3>
                    </div>
                    <p className="text-yellow-100 text-sm">
                      Complete gigs to increase your reputation and build trust in the network
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {reputation}
                    </p>
                    <p className="text-sm text-yellow-200 mt-1">points</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl border border-indigo-400/30 rounded-xl p-6">
                  <p className="text-indigo-200 text-sm font-semibold mb-2">Status</p>
                  <p className="text-2xl font-bold text-indigo-300">Active ✓</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-400/30 rounded-xl p-6">
                  <p className="text-green-200 text-sm font-semibold mb-2">Network</p>
                  <p className="text-2xl font-bold text-green-300">Testnet</p>
                </div>
              </div>

              {/* Disconnect Button */}
              <button
                onClick={disconnectWallet}
                className="w-full bg-gradient-to-r from-red-500/50 to-pink-500/50 hover:from-red-600 hover:to-pink-600 text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 border border-red-400/30"
              >
                🔌 Disconnect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WalletConnect
