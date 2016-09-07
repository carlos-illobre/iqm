var express = require('express')

var router = express.Router({mergeParams: true})
module.exports = router

router.get('/', function(req, res) {
	if (isNaN(req.query.start) || isNaN(req.query.end)) {
		res.sendStatus(400)
	} else if (isNaN(req.params.auctionId)) {
		res.sendStatus(404)
	} else {
		req.mysql.query("CALL myFriends(? ,?)", [req.user.userName, req.params.auctionId])
		.then(function(rows, fields) {
			res.json(rows[0][0])
		}).catch(function(error) {
			res.sendStatus(500)
		})
	}
})