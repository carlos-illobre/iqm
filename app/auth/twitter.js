var passport = require('passport')
var router = require('express').Router({mergeParams: true})
var config = require(__root_dirname + '/config.json').twitter
config.session = false

module.exports = router

.get('/', passport.authenticate('twitter', {
	session: false
}))
.get('/callback', passport.authenticate('twitter', config), function(req, res) {
	if (isNaN(req.user)) {
		return res.redirect(config.successRedirectTemplate.replace('{jwt}', req.user))
	}
	return res.sendStatus(req.user)
})
