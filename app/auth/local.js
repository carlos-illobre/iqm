var passport = require('passport')
var router = require('express').Router({mergeParams: true})
var config = require(__root_dirname + '/config.json').local

module.exports = router
.post('/', passport.authenticate('local', {session: false}), function(req, res) {
	if (isNaN(req.user)) {
		return res.redirect(config.successRedirectTemplate.replace('{jwt}', req.user))
	}
	return res.sendStatus(req.user)
})
