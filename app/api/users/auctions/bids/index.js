var express = require('express')

var router = express.Router({mergeParams: true})
module.exports = router

router.post('/', function(req, res) {
	if (isNaN(req.body.amount)) {
		res.sendStatus(400)
	} else if (isNaN(req.params.auctionId)) {
		res.sendStatus(404)
	} else {
		req.mysql.query(
			"SET @res=0; SET @pos=0; SET @coin=0; CALL newOffer(?, ?, ?, @res, @pos, @coin); SELECT @res, @pos, @coin",
			[req.user.userName, req.params.auctionId, req.body.amount]
		).then(function(rows) {
			res.status(201).json(rows[rows.length-1][0])
		}).catch(function(error) {
			res.sendStatus(500)
		})
	}
})

router.get('/', function(req, res) {
	if (isNaN(req.query.start) || isNaN(req.query.end)) {
		res.sendStatus(400)
	} else if (isNaN(req.params.auctionId)) {
		res.sendStatus(404)
	} else {
		req.mysql.query("CALL myBids(?, ?)", [req.user.userName, req.params.auctionId])
		.then(function(rows, fields) {
			res.json(rows[0][0])
		}).catch(function(error) {
			res.sendStatus(500)
		})
	}
})