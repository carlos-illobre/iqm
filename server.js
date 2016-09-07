global.__root_dirname = __dirname

var mysql = require('mysql')
var appModule = require('./app')
var http = require('http')

var port = process.env.PORT || 8080

var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'root',
	database        : 'qdm',
	multipleStatements: true
})

var app = appModule.create({
	mysql: {
		pool: pool
	},
	mandrill: {
		key: 'gmoSGC6PBG-4HRAvowrmqg',
	}
})

var server = http.createServer(app)
server.listen(port)
server.on('listening', function() {
	var addr = server.address();
	var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	console.log('Listening on ' + bind);
})
server.on('error', function(error) {
	if (error.syscall !== 'listen') { 
		throw error
	} 
	var addr = this.address() || {
		port: port
	}
	var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
	switch (error.code) { 
		case 'EACCES': 
			console.error(bind + ' requires elevated privileges')
			process.exit(1)
			break
		case 'EADDRINUSE': 
			console.error(bind + ' is already in use')
			process.exit(1)
			break
		default: 
			throw error
	} 
	if (error.syscall !== 'listen') {
		throw error;
	}
})
