const mongoose = require('mongoose')

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter name of food"]
  },
  description: {
    type: String,
    required: [true, "Please enter a description for the food"]
  },
  price: {
    type: Number,
    required: [true, "Please enter price of food"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true

  }

})

const Food = mongoose.model('Food', foodSchema)

module.exports = Food