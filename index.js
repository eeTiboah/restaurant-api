const express = require('express')
const connectDB = require('./config/db')
const dotenv = require('dotenv')
dotenv.config({path: './config/config.env'})

const errorHandler = require('./middleware/error')

const restaurantRouter = require('./routes/restaurant')
const foodRouter = require('./routes/food')


const app = express()

app.use(express.json())
connectDB()

app.use('/api/v1/restaurants', restaurantRouter)
app.use('/api/v1/foods', foodRouter)
app.use(errorHandler)

const port = process.env.PORT || 3000

app.listen(port, console.log(`App running on port ${port}`))