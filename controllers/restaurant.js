const asyncHandler = require('../middleware/async');
const Restaurant = require('../models/Restaurant');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/nodegeocoder');


// @desc      GET ALL RESTAURANTS
// @route     GET /api/v1/restaurants
// @access    Public

exports.getAllRestaurants = asyncHandler(async (req,res,next) => {
  let query;
  let reqQuery = {...req.query}
  const removeFields = ['select', 'sort', 'limit', 'page']

  removeFields.forEach(param => delete reqQuery[param])
  let queryStr = JSON.stringify(reqQuery)
  queryStr = queryStr.replace(/\b(gt|gte|lte|lt|in)\b/g, match => `$${match}`)

  query = Restaurant.find(JSON.parse(queryStr))

  if (req.query.select){
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)
  }

  if (req.query.sort){
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  } else {
    query = query.sort('-createdAt')
  }

  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 1
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await Restaurant.countDocuments()

  query = query.skip(startIndex).limit(limit)

  let pagination = {}

  if (startIndex > 0){
    pagination.prev = {
      page: page - 1,
      limit
    }
  }

  if (startIndex < total){
    pagination.next = {
      page: page + 1,
      limit
    }
  }

  const restaurants = await query
  
  res.status(200).json({
    success: true,
    pagination,
    count: restaurants.length,
    data: restaurants
  })

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