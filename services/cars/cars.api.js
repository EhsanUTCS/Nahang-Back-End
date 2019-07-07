var express = require('express')
var router = express.Router()

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

router.get('/cars', function (req, res) {
  res.send('cars home page')
})

router.get('/cars/about', function (req, res) {
  res.send('About cars')
})

module.exports = router