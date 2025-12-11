import { Link } from 'react-router-dom'
import { useState } from 'react'

const Navbar = () => {
  const [hoveredLink, setHoveredLink] = useState(null)

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              ⚡ B-SEN
            </div>
            <span className="text-xs font-semibold text-indigo-100">Skills Exchange</span>
          </Link>
          <div className="flex space-x-8">
            {[
              { to: '/', label: 'Home', icon: '🏠' },
              { to: '/post-gig', label: 'Post Gig', icon: '✨' },
              { to: '/my-gigs', label: 'My Gigs', icon: '📋' },
              { to: '/wallet', label: 'Wallet', icon: '💰' }
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onMouseEnter={() => setHoveredLink(link.to)}
                onMouseLeave={() => setHoveredLink(null)}
                className="relative group flex items-center space-x-1 font-medium transition-all duration-300"
              >
                <span className="text-lg">{link.icon}</span>
                <span className={hoveredLink === link.to ? 'text-yellow-200' : 'text-white hover:text-yellow-200'}>
                  {link.label}
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-300 group-hover:w-full transition-all duration-300"></div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar