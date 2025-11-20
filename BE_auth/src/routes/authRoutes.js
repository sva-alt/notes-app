const express = require('express')
const bcrypt = require('bcrypt');
const router = express.Router()
const AuthController = require('../controllers/authController.js')

const saltRounds = 10;

// Create user
router.post('/signup', AuthController.signup)


// Login user (using JWT)
router.post('/login', AuthController.login)

// Verify jwt
router.get('/verify', AuthController.verify)


module.exports = router

