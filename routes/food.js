const foodControllers = require('../controllers/food')
const express = require('express')
const router = express.Router({mergeParams: true})


router.route('/')
  .get(foodControllers.getAllFood)
  .post(foodControllers.addFood)

router.route('/:id')
  .get(foodControllers.getFood)
  .put(foodControllers.updateFood)
  .delete(foodControllers.deleteFood)

module.exports = router