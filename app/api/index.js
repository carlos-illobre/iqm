var express = require('express')
var router = express.Router({mergeParams: true})

module.exports = router
.use('/users', require('./users'))
.use('/auctions', require('./auctions'))