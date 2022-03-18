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

foodSchema.statics.getAverageCost = async function(restaurantId){
  
  const obj = await this.aggregate([
    {
      $match: {restaurant: restaurantId}
    },
    {
      $group: {
        _id: '$restaurant',
        averageCost: {$avg: '$price'}
      }
    }
  ])

  try {
    await this.model('Restaurant').findByIdAndUpdate(restaurantId, {averageCost: Math.ceil(obj[0].averageCost / 10) *10})
  } catch (err) {
    console.log(err)
  }

}

foodSchema.post('save', function(){
  this.constructor.getAverageCost(this.restaurant)
})

foodSchema.pre('remove', function(){
  this.constructor.getAverageCost(this.restaurant)
})

const Food = mongoose.model('Food', foodSchema)

module.exports = Food