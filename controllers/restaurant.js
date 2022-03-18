const asyncHandler = require('../middleware/async');
const Restaurant = require('../models/Restaurant');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/nodegeocoder');
const path = require('path')


// @desc      GET ALL RESTAURANTS
// @route     GET /api/v1/restaurants
// @access    Public

exports.getAllRestaurants = asyncHandler(async (req,res,next) => {
  res.status(200).json(res.advancedResults)
})

// @desc      GET A RESTAURANT
// @route     GET /api/v1/restaurants/:id
// @access    Public


exports.getRestaurant = asyncHandler( async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id)
  if (!restaurant){
    return next(new ErrorResponse(`Restaurant with id ${req.params.id} not found`, 404))
  }

  res.status(200).json({
    success: true,
    data: restaurant
  })
})

// @desc      ADD A RESTAURANT
// @route     POST /api/v1/restaurants
// @access    Public

exports.addRestaurant = asyncHandler( async (req,res,next) => {
  const restaurant = await Restaurant.create(req.body)
  if (!restaurant){
    return next(new ErrorResponse(`Restaurant with id ${req.params.id} not found`, 404))
  }

  res.status(201).json({
    success: true,
    data: restaurant
  })
})

// @desc      UPDATE A RESTAURANT
// @route     PUT /api/v1/restaurants/:id
// @access    Public

exports.updateRestaurant = asyncHandler( async (req,res,next) =>{
  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if (!restaurant){
    return res.status(400).json({
      success: false,
      message: `Restaurant not updated`
    })
  }

  res.status(200).json({
    success: true,
    data: restaurant
  })
})

// @desc      DELETE A RESTAURANT
// @route     DELETE /api/v1/restaurants/:id
// @access    Public

exports.deleteRestaurant = asyncHandler( async (req,res,next) => {
  const restaurant = await Restaurant.findById(req.params.id)
  if (!restaurant){
    return res.status(400).json({
      success: false,
      message: `Restaurant not updated`
    })
  }

  await restaurant.deleteOne()

  res.status(204).json({
    success: true
  })
})


// @desc      GET A RESTAURANT IN A ZIPCODE AND PROVIDING A DISTANCE
// @route     GET /api/v1/restaurants/RADIUS/:ZIPCODE/:DISTANCE
// @access    Public

exports.getRestaurantInDistance = asyncHandler( async (req,res,next) => {
  const {zipcode, distance} = req.params
  const loc = await geocoder.geocode(zipcode)
  const long = loc[0].longitude
  const lat = loc[0].latitude
  const radius = distance / 3693

  const restaurants = await Restaurant.find({
    location: { $geoWithin: { $centerSphere: [ [ long, lat ], radius ] } }
  })

  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants
  })
})


// @desc      UPDATE A RESTAURANT PHOTO
// @route     PUT /api/v1/restaurants/:id/photo
// @access    Public

exports.updateRestaurantPhoto = asyncHandler(async (req,res,next) => {
  const restaurant = await Restaurant.findById(req.params.id)
  if (!restaurant){
    return next(new ErrorResponse(`Restaurant with id ${req.params.id} not found`, 404))
  }

  if(!req.files){
    return next(new ErrorResponse(`Please upload a file`, 400))
  }

  const file = req.files.file

  if (!file.mimetype.startsWith('image')){
    return next(new ErrorResponse(`Please upload an image file`, 404))
  }

  if (file.size > process.env.MAX_FILE_SIZE){
    return next(new ErrorResponse(`Please upload an image file with size less than ${process.env.MAX_FILE_SIZE}`, 404))
  }

  file.name = `photo-${restaurant._id}${path.parse(file.name).ext}`

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err){
      return next(new ErrorResponse(`Problem with file upload`, 400))
    }

    await Restaurant.findByIdAndUpdate(req.params.id, {photo: file.name})
    res.status(200).json({
      success: true,
      data: file.name
    })
  })

})