require('dotenv').config()

const Notes = require('../models/notesModel.js')
const verify = require('../utils/verificationTools.js')
const path = require('path')
const fs = require('fs').promises
const crypto = require('crypto')

class NotesController {
  async _authMiddleware(req, res) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' })

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  try {
    const payload = await verify.verifyJWT(token)
    req.user = payload
    return payload
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}


  _notesDir() {
    // folder where markdown files are stored (relative to this controller file)
    return path.resolve(__dirname, '../../../notes')
  }

  async listAll(req, res) {
    try {
      const payload = await this._authMiddleware(req, res)
      const userId = payload.userId || null
      if (!userId) return res.status(401).json({ error: 'Unauthenticated' })

      const notes = await Notes.find({ userId }).sort({ createdAt: -1 })
      return res.status(201).json({ notes })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  async listOne(req, res) {
    try {
      const payload = await this._authMiddleware(req, res)
      const userId = payload.userId || null
      if (!userId) return res.status(401).json({ error: 'Unauthenticated' })

      const id = req.params.id
      const note = await Notes.findById(id)
      if (!note) return res.status(404).json({ error: 'Note not found' })
      if (note.userId !== userId) return res.status(403).json({ error: 'Forbidden' })

      const filePath = path.join(this._notesDir(), note.fileKey)
      let content = ''
      try {
        content = await fs.readFile(filePath, 'utf8')
      } catch (err) {
        // if file missing, still return metadata but flag missing content
        content = null
      }

      return res.status(201).json({ note, content })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  async create(req, res) {
    try {
      const payload = await this._authMiddleware(req, res)
      const userId = payload.userId || null
      if (!userId) return res.status(401).json({ error: 'Unauthenticated' })

      const { title, content } = req.body || {}
      if (!title) return res.status(400).json({ error: 'Title is required' })

      const notesDir = this._notesDir()
      await fs.mkdir(notesDir, { recursive: true })

      const fileKey = `${(crypto.randomUUID && crypto.randomUUID()) || crypto.randomBytes(16).toString('hex')}.md`
      const filePath = path.join(notesDir, fileKey)

      const bodyContent = typeof content === 'string' ? content : ''
      await fs.writeFile(filePath, bodyContent, 'utf8')

      const note = await Notes.create({ userId, title, fileKey })

      return res.status(201).json({ note })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  async update(req, res) {
    try {
      const payload = await this._authMiddleware(req, res)
      const userId = payload.userId || null
      if (!userId) return res.status(401).json({ error: 'Unauthenticated' })

      const id = req.params.id
      const { title, content } = req.body || {}

      const note = await Notes.findById(id)
      if (!note) return res.status(404).json({ error: 'Note not found' })
      if (note.userId !== userId) return res.status(403).json({ error: 'Forbidden' })

      // Update file content if provided
      if (typeof content === 'string') {
        const filePath = path.join(this._notesDir(), note.fileKey)
        await fs.writeFile(filePath, content, 'utf8')
      }

      // Update title if provided
      const updated = await Notes.findByIdAndUpdate(
        id,
        { ...(title ? { title } : {}) },
        { new: true }
      )

      return res.status(201).json({ note: updated })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  async remove(req, res) {
    try {
      const payload = await this._authMiddleware(req, res)
      const userId = payload.userId || null
      if (!userId) return res.status(401).json({ error: 'Unauthenticated' })

      const id = req.params.id
      const note = await Notes.findById(id)
      if (!note) return res.status(404).json({ error: 'Note not found' })
      if (note.userId !== userId) return res.status(403).json({ error: 'Forbidden' })

      const filePath = path.join(this._notesDir(), note.fileKey)
      try {
        await fs.unlink(filePath)
      } catch (err) {
        // ignore missing file
      }

      await Notes.findByIdAndDelete(id)

      return res.status(201).json({ message: "File deleted" })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
}

// export an instance so routes receive functions
module.exports = new NotesController()
