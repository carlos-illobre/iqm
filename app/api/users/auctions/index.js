var express = require('express')

var router = express.Router({mergeParams: true})
module.exports = router

router.use('/:auctionId/bids', require('./bids'))
router.use('/:auctionId/friends', require('./friends'))
