require('dotenv').config()

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel.js')

const saltRounds = 10;

class AuthController {

  async signup(req, res){

    try {

      const {name, email, password} = req.body
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }

      //Test email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)){
        return res.status(400).json({ 
          error: 'Invalid email' 
        });
      }

      //Test email availability
      const emailInUse = await User.findOne({ email: email })
      if (emailInUse){
        return res.status(400).json({ 
          error: 'Email already in use' 
        });
      }

      //Test password
      if (password.length < 8){
        return res.status(400).json({ 
          error: 'Password needs at least 8 characters' 
        });
      }
    
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      const user = new User({
          name: name,
          email: email,
          password: hashedPassword
      })

      const newUser = await user.save()
      console.log(user._id.toString())
      return res.status(201).json({message:"Created successfully", id: user.id, name:user.name, email: user.email})
    } catch (error) {
      console.error('Error in sign-up:', error);
      return res.status(500).json({ 
        error: 'Error while trying to create the user' 
      });
    }
  }

  async login(req, res) {

    try {
      const { email, password } = req.body;

      //check for data
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email y contraseña son requeridos' 
        });
      }
      
      //find user by email
      const user = await User.findOne({ email: email })
      if (!user){
        return res.status(400).json({ 
          error: 'Invalid credentials' 
        });
      }

      //check if passwords match
      const match = await bcrypt.compare(password, user.password);
      if (!match){
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email
        },
        process.env.JWT_SECRET, 
        { expiresIn: '24h'}
      )

      // on success, return user (or generate JWT)
      return res.status(201).json({ message: 'Logged in', id:user._id, jwt: token})
    } catch (error) {
      console.error('Error in login:', error);
      return res.status(500).json({ error: 'Internal error' })
    }
  }

  async verify(req, res)  {
    try {
      // Accept either "Bearer <token>" or a raw token in the Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
      }

      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload) {
        return res.status(201).json({ message: 'Verified', jwt: token, payload });
      } else {
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      console.error('Error in verify:', error);
      // Treat verification errors as authentication failures (401)
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }
}

// export an instance so routes receive functions
module.exports = new AuthController()
