var express 		= require('express')
var path 			= require('path')
var logger 			= require('morgan')
var cookieParser 	= require('cookie-parser')
var bodyParser 		= require('body-parser')
var Promise 		= require('promise')
var mandrill 		= require('mandrill-api/mandrill')
var session      	= require('express-session')
var passportConfig	= require('./auth/config')

exports.create = function(options) {
	var app = express()
	app.use(logger('dev'))
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: true }))
	app.use(cookieParser())
	app.use(express.static('./public'))
		
	app.use(function(req, res, next) {
		req.domain = req.protocol + '://' + req.get('host')
		return next()
	})
	
	app.use(function(req, res, next) {
		var pool = options.mysql.pool
		req.mysql = {
			query: function(query, values) {
				console.log('------------------------------------------')
				console.log(new Date().toGMTString())
				console.log(query)
				console.log(values)
				return new Promise(function(resolve, reject) {
					pool.query(query, values, function(err, rows, fields) {
						if (err) {
							console.error(err)
							reject(err)
						} else {
							resolve(rows, fields)
						}
					})
				})
			}
		}
		return next()
	})
	
	app.use(function(req, res, next) {
		var mandrillClient = new mandrill.Mandrill(options.mandrill.key)
		req.emailSender = {
			send: function(message) {
				return new Promise(function(resolve, reject) {
					mandrillClient.messages.send({"message": message, "async": true}, function(result) {
						console.log('------------------------------------------')
						console.log(new Date().toGMTString() + ' Email sent.')
						console.log(result)
						resolve(result)
					}, function(error) {
						console.error(err)
						reject(error)
					})
				})
			}
		}
		return next()
	})

	app.use(session({ secret: 'ns593gszhkotwkrajt4wu7w2yrt4hvqp', resave: true, saveUninitialized: true }))	
	app.use(passportConfig.initialize())
	app.use(passportConfig.session())
	
	app.use('/auth', require('./auth'))
	app.use('/api', require('./api'))

	app.use(function(req, res, next) {
		res.sendStatus(404)
	})

	app.use(function(err, req, res, next) {
		console.error(err) 
		res.sendStatus(err.status || 500) 
	})
	return app
}

