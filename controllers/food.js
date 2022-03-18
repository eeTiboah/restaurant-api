const asyncHandler = require('../middleware/async')
const Food = require('../models/Food')
const Restaurant = require('../models/Restaurant')
const ErrorResponse = require('../utils/errorResponse')

// @desc      GET ALL FOOD IN A RESTAURANT
// @route     GET /api/v1/restaurants/:restaurantId/food
// @access    Public

exports.getAllFood = asyncHandler(async (req,res,next) => {
  let query

  if (req.params.restaurantId){
    query = Food.find({bootcamp: req.params.restaurantId})
  } else{
    query = Food.find().populate({
      path: 'restaurant',
      select: 'name description'
    })
  }

  const foods = await query

  res.status(200).json({
    success: true,
    count: foods.length,
    data: foods
  })
})


// @desc      GET A FOOD
// @route     GET /api/v1/food/:id
// @access    Public

exports.getFood = asyncHandler(async (req,res,next) => {
  const food = await Food.findById(req.params.id).populate({
    path: 'restaurant',
    select: 'name description'
  })

  if (!food){
    return next(new ErrorResponse(`Food with id ${req.params.id} not found`, 404))
  }

  res.status(200).json({
    success: true,
    data: food
  })
})

// @desc      ADD FOOD
// @route     POST /api/v1/restaurants/:restaurantId/food
// @access    Public

exports.addFood = asyncHandler(async(req,res,next) => {
  req.body.restaurant = req.params.restaurantId

  const restaurant = await Restaurant.findById(req.params.restaurantId)
  if (!restaurant){
    return next(new ErrorResponse(`Restaurant with id ${req.params.restaurantId} not found`, 404))

  }

  const food = await Food.create(req.body)
  res.status(201).json({
    success: true,
    data: food
  })
})

// @desc      UPDATE FOOD
// @route     PUT /api/v1/food/:id
// @access    Public
exports.updateFood = asyncHandler(async (req,res,next) => {
  let food = await Food.findById(req.params.id)
  if (!food){
    return next(new ErrorResponse(`Food with id ${req.params.id} not found`, 404))
  }

  food = await Food.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    data: food
  })
})

// @desc      DELETE FOOD
// @route     DELETE /api/v1/food/:id
// @access    Public
exports.deleteFood = asyncHandler(async (req,res,next) => {
  let food = await Food.findById(req.params.id)
  if (!food){
    return next(new ErrorResponse(`Food with id ${req.params.id} not found`, 404))
  }

  await food.deleteOne()

  res.status(204).json({
    success: true
  })

})