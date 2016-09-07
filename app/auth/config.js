var passport 			= require('passport')
var BearerStrategy 		= require('passport-http-bearer')
var jwt 				= require('jsonwebtoken')
var LocalStrategy 		= require('passport-local').Strategy
var GoogleStrategy 		= require('passport-google-oauth2').Strategy
var FacebookStrategy	= require('passport-facebook').Strategy
var TwitterStrategy  	= require('passport-twitter-email').Strategy
var config				= require(__root_dirname + '/config.json')

var secret = 'ns593gszheotwkrajt4wu7w2yrt4heqp'

var googleplusConfig = config.googleplus
googleplusConfig.passReqToCallback = true

var facebookConfig = config.facebook
facebookConfig.passReqToCallback = true
facebookConfig.profileFields = ['emails']

var twitterConfig = config.twitter
twitterConfig.passReqToCallback = true

module.exports = passport

passport.use(new BearerStrategy(function(token, done) {
	try {
		var profile = jwt.verify(token, secret)
		return done(null, profile, { scope: 'all' })
	} catch(err) {
		return done(null, false)
	}
}))

passport.use(new LocalStrategy({ passReqToCallback:true }, function(req, username, password, done) {
	req.mysql.query(
		"select * from admin_users where username=? and password=?",
		[username, password]
	).then(function(rows) {
		if (rows.length) {
			var user = rows[0]
			user.isAdmin = true
			return user
		}
		return req.mysql.query(
			"select * from users where username=? and password=?",
			[username, password]
		).then(function(rows) {
			return rows.length ? rows[0] : null
		})
	}).then(function(user) {
		if (!user) {
			return done(null, false)
		}
		if (!user.isAdmin && user.stateId != 4) {
			return done(null, 403)
		}
		user.secret = secret
		return done(null, jwt.sign(user, secret))
	}).catch(function(error) {
		console.log(error)
		return done(error)
	})
}))

passport.use(new GoogleStrategy(googleplusConfig, function(req, accessToken, refreshToken, profile, done) {
	var email = profile.email
	return req.mysql.query("select * from users where email=?", [email])
	.then(function(rows) {
		return rows.length ? rows[0] : null
	})
	.then(function(user) {
		var username = profile.id.substring(0, 20)
		var password = profile.id.substring(0, 30)
		var stateId = 4
		return user || req.mysql.query(
			"INSERT INTO users (username, password, email, stateId) VALUES (?, ?, ?, ?)",
			[username, password, email, stateId]
		)
		.then(function(result) {
			return {
				idUser: result.insertId,
				userName: username,
				email: email,
				password: password,
				stateId: stateId
			}
		})
	})
	.then(function(user) {
		if (user.stateId != 4) {
			return done(null, 403)
		}
		user.secret = secret
		return done(null, jwt.sign(user, secret))
	}).catch(function(error) {
		console.log(error)
		return done(error)
	})
}))

passport.use(new FacebookStrategy(facebookConfig, function(req, accessToken, refreshToken, profile, done) {
	var email = profile._json.email
	return req.mysql.query("select * from users where email=?", [email])
	.then(function(rows) {
		return rows.length ? rows[0] : null
	})
	.then(function(user) {
		var username = profile.id.substring(0, 20)
		var password = profile.id.substring(0, 30)
		var stateId = 4
		return user || req.mysql.query(
			"INSERT INTO users (username, password, email, stateId) VALUES (?, ?, ?, ?)",
			[username, password, email, stateId]
		)
		.then(function(result) {
			return {
				idUser: result.insertId,
				userName: username,
				email: email,
				password: password,
				stateId: stateId
			}
		})
	})
	.then(function(user) {
		if (user.stateId != 4) {
			return done(null, 403)
		}
		user.secret = secret
		return done(null, jwt.sign(user, secret))
	}).catch(function(error) {
		console.log(error)
		return done(error)
	})
}))

passport.use(new TwitterStrategy(twitterConfig, function(req, accessToken, refreshToken, profile, done) {
	var email = profile._json.email
	return req.mysql.query("select * from users where email=?", [email])
	.then(function(rows) {
		return rows.length ? rows[0] : null
	})
	.then(function(user) {
		var username = profile.username.substring(0, 20)
		var password = profile.id.substring(0, 30)
		var stateId = 4
		return user || req.mysql.query(
			"INSERT INTO users (username, password, email, stateId) VALUES (?, ?, ?, ?)",
			[username, password, email, stateId]
		)
		.then(function(result) {
			return {
				idUser: result.insertId,
				userName: username,
				email: email,
				password: password,
				stateId: stateId
			}
		})
	})
	.then(function(user) {
		if (user.stateId != 4) {
			return done(null, 403)
		}
		user.secret = secret
		return done(null, jwt.sign(user, secret))
	}).catch(function(error) {
		console.log(error)
		return done(error)
	})
}))
