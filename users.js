const express = require('express')
const router = express.Router()
const User = require('../models/User')
// Note: soroban-client imports can differ by version. We don't need a client here yet.
// When adding on-chain reputation lookup, use the official JS SDK or the soroban-cli wrapper.

// Get user profile
router.get('/:address', async (req, res) => {
  try {
    let user = await User.findOne({ address: req.params.address })
    
    if (!user) {
      user = new User({ address: req.params.address })
      await user.save()
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get user reputation
router.get('/:address/reputation', async (req, res) => {
  try {
    // TODO: Call Soroban contract to get reputation
    // const reputation = await getReputationFromContract(req.params.address)
    
    const user = await User.findOne({ address: req.params.address })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ reputation: user.reputation })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router