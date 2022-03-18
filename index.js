const express = require('express')
const connectDB = require('./config/db')
const dotenv = require('dotenv')
dotenv.config({path: './config/config.env'})
const fileUpload = require('express-fileupload')
const path = require('path')

const errorHandler = require('./middleware/error')

const restaurantRouter = require('./routes/restaurant')
const foodRouter = require('./routes/food')


const app = express()
app.use(fileUpload())

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
connectDB()

app.use('/api/v1/restaurants', restaurantRouter)
app.use('/api/v1/foods', foodRouter)
app.use(errorHandler)

const port = process.env.PORT || 3000

app.listen(port, console.log(`App running on port ${port}`))