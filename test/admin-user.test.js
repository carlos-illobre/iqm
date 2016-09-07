var chakram	= require('chakram')
var expect 	= chakram.expect
var testLoginLocal = require('./test-login-local')

var usersUrl			= 'http://localhost:8080/api/users'
var changeUserStatusUrl	= 'http://localhost:8080/api/users/{username}/status/{status}'

var userAdmin = {
	username: 'admin',
	password: 'admin'
}

var seed = new Date().toISOString().replace(/[^0-9]/g, "")
var newUser = {
	username: 'AU' + seed,
	password: 'AP' + seed,
	email: 'aa@a' + seed
}

describe('as admin', function() {
	
	var server, adminJwt
	
	before(function() {
		server = require('../server.js')
		var response = chakram.post(usersUrl, newUser)
		expect(response).to.have.status(202)
		return chakram.wait()
	})

	it('should login with local authentication', function() {
		return testLoginLocal(userAdmin)
		.then(function(jwt) {
			expect(jwt).to.be.ok
			expect(jwt).to.be.a('string')
			adminJwt = jwt
		})
	})
	
	it('should not unblock an unexistent user', function() {
		var url = changeUserStatusUrl.replace('{username}', 'unexistent-user').replace('{status}', 4)
		var response = chakram.put(url, {}, {
			headers: {
				authorization: 'Bearer ' + adminJwt
			}
		})
		expect(response).to.have.status(404)
		return chakram.wait()
	})
	
	it("should not change the user's status to a not numeric value", function() {
		var url = changeUserStatusUrl.replace('{username}', newUser.username).replace('{status}', 'xxx')
		var response = chakram.put(url, {}, {
			headers: {
				authorization: 'Bearer ' + adminJwt
			}
		})
		expect(response).to.have.status(400)
		return chakram.wait()
	})
	
})