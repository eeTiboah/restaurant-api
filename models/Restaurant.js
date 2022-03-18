const mongoose = require('mongoose')
const geocoder = require('../utils/nodegeocoder')
const slugify = require('slugify')

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please give a name to your restaurant'],
    unique: true,
    trim: true
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  email: {
    type: String,
    match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    'Please add a valid email']
  },
  website: {
    type: String,
    match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
    'Please use a valid URL with HTTP or HTTPS']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  cuisineType: {
    type: [String],
    enum: ['Asian', 'Ethiopian', 'Australian', 'French', 'Italian', 'Hawaiin', 'Indian', 'Japanes', 'African']
  },
  openingHours:{
    type: Object,
    required: [true, 'Please add the time you operate']
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  averageRating: Number,
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
})

restaurantSchema.pre('save', async function(next){
  const loc = await geocoder.geocode(this.address)
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].state,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  }

  this.address = undefined
  next()
})

restaurantSchema.pre('save', async function(next){
  this.slug = slugify(this.name, {lower: true})
  next()
})

restaurantSchema.pre('remove', async function(next) {
  await this.model('Food').deleteMany({restaurant: this._id})
  next()
})

restaurantSchema.virtual('food', {
  ref: 'Food',
  localField: '_id',
  foreignField: 'restaurant',
  justOne: false
})

const Restaurant = mongoose.model('Restaurant', restaurantSchema)

module.exports = Restaurant