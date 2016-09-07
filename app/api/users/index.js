var express 		= require('express')
var uuidGenerator 	= require('uuid')
var passport 		= require('passport')
var jwt 			= require('jsonwebtoken')

var router = express.Router({mergeParams: true})
module.exports = router

function getEmailVerificationTemplate(user, domain, uuid) {
	var link = domain + '/api/users/' + user.username + '/email/' + uuid
	return {
		"html": '<p>Verifique su cuenta haciendo click <a href="' + link + '">aqui</a></p>',
		"subject": "Verificar cuenta",
		"from_email": "admin@agrofinger.esy.es",
		"from_name": "Quien da menos",
		"to": [
			{
				"email": user.email,
				"name": user.username,
				"type": "to"
			}
		]
	}
}

function getEmailVerificationExpirationDate() {
	var expirationDate = new Date()
	expirationDate.setDate(expirationDate.getDate() + 1)
	return expirationDate
}
	
router.post('/', function(req, res) {
	if (!req.body.username || !req.body.email || !req.body.password) {
		return res.sendStatus(400)
	}
	var uuid = uuidGenerator.v1()
	var expirationDate = getEmailVerificationExpirationDate()
	req.mysql.query(
		"INSERT INTO users (username, password, email, stateId, email_validation_key, email_validation_key_expiration) VALUES (?, ?, ?, 0, ?, ?)",
		[req.body.username, req.body.password, req.body.email, uuid, expirationDate]
	).then(function(result) {
		var template = getEmailVerificationTemplate(req.body, req.domain, uuid)
		req.emailSender.send(template)
		res.sendStatus(202)
	}).catch(function(error) {
		if (error.message.search(/^ER_DUP_ENTRY: .*userName/) != -1) {
			res.status(400).send('username already exists')
		} else if (error.message.search(/^ER_DUP_ENTRY: .*email/) != -1) {
			res.status(422).send('email already exists')
		} else {
			console.error(error)
			res.sendStatus(500)
		}
	})
})

router.get('/:username/email/:uuid', function(req, res) {
	if (!req.params.username || !req.params.uuid) {
		return res.sendStatus(400)
	}
	req.mysql.query(
		"select * from users where userName=? and email_validation_key=?",
		[req.params.username, req.params.uuid]
	).then(function(rows, fields) {
		if (rows.length) {
			var expirationDate = new Date(rows[0].email_validation_key_expiration)
			if (new Date() > expirationDate) {
				res.redirect('/email-resend-verification.html?username=' + req.params.username + '&uuid=' + req.params.uuid)
			} else {
				return req.mysql.query("update users set stateId=1, email_validation_key=null where userName=?", [req.params.username])
			}
		} else {
			res.sendStatus(404)
		}
	}).then(function(result) {
		res.redirect('/email-verificated.html?user=' + req.params.username)
	}).catch(function(error) {
		console.error(error)
		res.sendStatus(500)
	})
})

router.put('/:username/email/:uuid', function(req, res) {
	if (!req.body.username || !req.body.email || !req.body.uuid) {
		return res.sendStatus(400)
	}
	var uuid = uuidGenerator.v1()
	var expirationDate = getEmailVerificationExpirationDate()
	req.mysql.query(
		"UPDATE users SET email_validation_key=?, email_validation_key_expiration=? WHERE username=? and email_validation_key=?",
		[uuid, expirationDate, req.params.username, req.body.uuid]
	).then(function(result) {
		if (result.affectedRows) {
			var template = getEmailVerificationTemplate(req.body, req.domain, uuid)
			req.emailSender.send(template)
			return res.sendStatus(202)
		} else {
			return res.sendStatus(404)
		}
	}).catch(function(error) {
		if (error.message.search(/^ER_TRUNCATED_WRONG_VALUE_FOR_FIELD:/) != -1) {
			res.sendStatus(400)
		} else {
			console.error(error)
			return res.sendStatus(500)
		}
	})
})

var usersAuthCache = function() {
	var data = {}
	return {
		put: function(key, value) {
			if (Object.keys(data).length > 200000) {
				data = {}
			}
			data[key] = value
		},
		get: function(key) {
			return data[key]
		},
		remove: function(key) {
			delete data[key]
		}
	}
}()

router.put('/:username/status/:status', passport.authenticate('bearer', { session: false }), function(req, res) {
	if (!req.user.isAdmin) {
		return res.sendStatus(403)
	}
	return req.mysql.query(
		"UPDATE users SET stateId=? WHERE username=?",
		[req.params.status, req.params.username]
	).then(function(result) {
		if (!result.affectedRows) {
			return res.sendStatus(404)
		}
		usersAuthCache.remove(req.params.username)
		return res.sendStatus(204)
	}).catch(function(error) {
		if (error.message.search(/^ER_TRUNCATED_WRONG_VALUE_FOR_FIELD:/) != -1) {
			return res.sendStatus(400)
		}
		console.error(error)
		return res.sendStatus(500)
	})
})

router.all('/me/*', passport.authenticate('bearer', { session: false }), function(req, res, next) {
	if (usersAuthCache.get(req.user.userName) == req.user.password) {
		return next()
	}
	return req.mysql.query(
		"select stateId from users where username=? and password=?",
		[req.user.userName, req.user.password]
	).then(function(rows, fields) {
		if (!rows.length) {
			return res.sendStatus(401)
		}
		if (rows[0].stateId != 4) {
			return res.sendStatus(403)
		}
		usersAuthCache.put(req.user.userName, req.user.password)
		return next()
	}).catch(function(error) {
		return res.sendStatus(500)
	})
})

router.put('/me/password', function(req, res) {
	req.mysql.query("update users set password=? where username=?", [req.body.password, req.user.userName])
	.then(function(rows, fields) {
		usersAuthCache.remove(req.user.userName)
		req.user.password = req.body.password
		res.status(201).send(jwt.sign(req.user, req.user.secret))
	}).catch(function(error) {
		res.sendStatus(500)
	})
})

router.get('/me/coins', function(req, res) {
	req.mysql.query("CALL showCoins(?, ?)", [req.user.userName, req.user.password])
	.then(function(rows, fields) {
		res.json(rows[0][0])
	}).catch(function(error) {
		res.sendStatus(500)
	})
})

router.use('/me/auctions', require('./auctions'))
router.use('/me/packages', require('./packages'))
