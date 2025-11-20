require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect(process.env.DB_CONNECTION)
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to database'))

app.use(express.json())
const authRouter = require('./src/routes/authRoutes')
app.use('/auth', authRouter)

app.listen(process.env.PORT, () =>  console.log("Server started"));

