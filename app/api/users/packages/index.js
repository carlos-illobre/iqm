var express = require('express')

var router = express.Router({mergeParams: true})
module.exports = router

router.get('/', function(req, res) {
	req.mysql.query("CALL showPackages(?)", [req.user.userName])
	.then(function(rows, fields) {
		res.json(rows[0][0])
	}).catch(function(error) {
		res.sendStatus(500)
	})
})

router.get('/:packageId', function(req, res) {
	if (isNaN(req.params.packageId)) {
		res.sendStatus(404)
	} else {
		req.mysql.query("CALL showPackage(?, ?)", [req.user.userName, req.params.packageId])
		.then(function(rows, fields) {
			res.json(rows[0][0])
		}).catch(function(error) {
			res.sendStatus(500)
		})
	}
})
