require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors')
const app = express();

app.use(cors())

// Disable caching for API responses to prevent 304 responses with stale data
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

mongoose.connect(process.env.DB_CONNECTION)
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to database'))

app.use(express.json())
const authRouter = require('./src/routes/notesRoutes')
app.use('/notes', authRouter)

app.listen(process.env.PORT, () =>  console.log("Server started"));

