var router = require('express').Router({mergeParams: true})
var passport = require('passport')

module.exports = router 
.use('/local', require('./local'))
.use('/googleplus', require('./googleplus'))
.use('/facebook', require('./facebook'))
.use('/twitter', require('./twitter'))


