var express = require('express')

var router = express.Router({mergeParams: true})
module.exports = router

router.get('/', function(req, res) {
	if (isNaN(req.query.start) || isNaN(req.query.end)) {
		res.sendStatus(400)
	} else {
		req.mysql.query("CALL showAuctionsAll(? ,?)", [req.query.start, req.query.end])
		.then(function(rows, fields) {
			res.json(rows[0][0])
		}).catch(function(error) {
			res.sendStatus(500)
		})
	}
})

router.get('/:auctionId', function(req, res) {
	if (isNaN(req.params.auctionId)) {
		res.sendStatus(404)
	} else {
		req.mysql.query("CALL showAuction(?)", [req.params.auctionId])
		.then(function(rows, fields) {
			res.json(rows[0][0])
		}).catch(function(error) {
			res.sendStatus(500)
		})
	}
})

router.get('/:auctionId/graltable', function(req, res) {
	if (isNaN(req.query.start) || isNaN(req.query.end)) {
		res.sendStatus(400)
	} else if (isNaN(req.params.auctionId)) {
		res.sendStatus(404)
	} else {
		req.mysql.query("CALL showGralTable(? ,?)", [req.query.start, req.query.end])
		.then(function(rows, fields) {
			res.json(rows[0][0])
		}).catch(function(error) {
			res.sendStatus(500)
		})
	}
})

router.get('/category/:category', function(req, res) {
	req.mysql.query("CALL showAuctionByCategory(?)", [req.params.category])
	.then(function(rows, fields) {
		res.json(rows[0][0])
	}).catch(function(error) {
		res.sendStatus(500)
	})
})