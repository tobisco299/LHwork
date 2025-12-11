const express = require('express')
const router = express.Router()
const Gig = require('../models/Gig')
const { invokeFunction } = require('../utils/sorobanInvoke')

// Get all gigs
router.get('/', async (req, res) => {
  try {
    const gigs = await Gig.find().sort({ createdAt: -1 })
    res.json(gigs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create new gig
router.post('/', async (req, res) => {
  try {
    const { title, description, paymentAmount, workerAddress } = req.body
    
    // TODO: Create escrow contract on Soroban
    // const contractId = await createEscrowContract(paymentAmount, workerAddress)
    
    // clientAddress should be provided by frontend (connected wallet)
    const clientAddr = req.body.clientAddress || process.env.STELLAR_ACCOUNT || null

    const gig = new Gig({
      title,
      description,
      paymentAmount,
      clientAddress: clientAddr || 'UNKNOWN',
      workerAddress,
    })

    const newGig = await gig.save()

    // Invoke contract create_job to register job on-chain (uses soroban CLI)
    try {
      const sourceKey = req.body.sourceSecret || process.env.STELLAR_SECRET_KEY
      const invokeArgs = {
        client: clientAddr || '',
        worker: workerAddress,
        amount: paymentAmount,
      }
      const result = await invokeFunction('create_job', invokeArgs, { source: sourceKey })
      // Store raw contract stdout for debugging/inspection
      newGig.contractResult = result.stdout
      // Try to parse a returned job id from the CLI output (look for a number)
      const m = result.stdout && result.stdout.match(/(\d+)/)
      if (m) {
        newGig.contractId = m[1]
      }
      await newGig.save()
      res.status(201).json({ gig: newGig, contract: result.stdout })
    } catch (err) {
      // If contract invocation fails, return gig info but surface the error
      return res.status(201).json({ gig: newGig, contractError: err })
    }
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Accept a gig (worker agrees to do the job)
router.post('/:id/accept', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
    if (!gig) return res.status(404).json({ message: 'Gig not found' })

    const workerAddress = req.body.workerAddress || req.body.publicKey
    if (!workerAddress) return res.status(400).json({ message: 'workerAddress required' })

    gig.workerAddress = workerAddress
    gig.status = 'in-progress'
    await gig.save()

    res.json(gig)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get user's gigs
router.get('/my-gigs', async (req, res) => {
  try {
    // TODO: Get address from authenticated user
    const address = req.query.address

    const posted = await Gig.find({ clientAddress: address })
    const accepted = await Gig.find({ workerAddress: address })

    res.json({ posted, accepted })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Mark gig as complete
router.post('/:id/complete', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' })
    }

    // Call Soroban contract to mark job complete
    try {
      const sourceKey = req.body.sourceSecret || process.env.STELLAR_SECRET_KEY
      // our contract expects job id and caller address; since we stored no job id mapping yet,
      // we pass the MongoDB _id as job identifier or rely on off-chain mapping. For now pass gig._id as job id string.
      const invokeArgs = {
        job_id: gig.contractId || gig._id.toString(),
        caller: req.body.caller || gig.clientAddress || ''
      }

      const result = await invokeFunction('complete_job', invokeArgs, { source: sourceKey })
      gig.status = 'completed'
      gig.contractResult = result.stdout
      await gig.save()
      res.json({ gig, contract: result.stdout })
    } catch (err) {
      return res.status(500).json({ message: 'Contract invocation failed', error: err })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router