const express = require('express')
const router = express.Router()
const NotesController = require('../controllers/notesController.js')


// List all notes of a user
router.get('/', (req, res, next) => NotesController.listAll(req, res, next))

// Obtain one note
router.get('/:id', (req, res, next) => NotesController.listOne(req, res, next))

// Create a note
router.post('/', (req, res, next) => NotesController.create(req, res, next))

// Update a note
router.put('/:id', (req, res, next) => NotesController.update(req, res, next))

// remove a note
router.delete('/:id', (req, res, next) => NotesController.remove(req, res, next))

module.exports = router
