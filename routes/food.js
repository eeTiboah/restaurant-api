const foodControllers = require('../controllers/food')
const express = require('express')
const advancedResults = require('../middleware/advancedResults')
const Food = require('../models/Food')
const router = express.Router({mergeParams: true})



router.route('/')
  .get(advancedResults(Food, {
    path: 'restaurant',
    select: 'name description'
  }), foodControllers.getAllFood)
  .post(foodControllers.addFood)

router.route('/:id')
  .get(foodControllers.getFood)
  .put(foodControllers.updateFood)
  .delete(foodControllers.deleteFood)

module.exports = router