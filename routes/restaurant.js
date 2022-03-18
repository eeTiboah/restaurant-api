const express = require('express')
const restaurantController = require('../controllers/restaurant')
const advancedResults = require('../middleware/advancedResults')
const Restaurant = require('../models/Restaurant')
const router = express.Router()
const foodRouter = require('./food')

router.use('/:restaurantId/foods', foodRouter)

router.route('/radius/:zipcode/:distance')
  .get(restaurantController.getRestaurantInDistance)

router.route('/:id/photo')
  .put(restaurantController.updateRestaurantPhoto)

router.route('/')
  .get(advancedResults(Restaurant, 'food'), restaurantController.getAllRestaurants)
  .post(restaurantController.addRestaurant)

router.route('/:id')
  .get(restaurantController.getRestaurant)
  .put(restaurantController.updateRestaurant)
  .delete(restaurantController.deleteRestaurant)



module.exports = router