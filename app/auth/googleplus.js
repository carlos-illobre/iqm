var passport = require('passport')
var router = require('express').Router({mergeParams: true})
var config = require(__root_dirname + '/config.json').googleplus
config.session = false

module.exports = router
.get('/', passport.authenticate('google', {
	session: false,
	scope: [
		'https://www.googleapis.com/auth/plus.login',
		'https://www.googleapis.com/auth/plus.profile.emails.read'
	]
}))
.get('/callback', passport.authenticate('google', config), function(req, res) {
	if (isNaN(req.user)) {
		return res.redirect(config.successRedirectTemplate.replace('{jwt}', req.user))
	}
	return res.sendStatus(req.user)
})
