var testLoginLocal = require('./test-login-local')
var chakram	= require('chakram')
var expect 	= chakram.expect

var usersUrl			= 'http://localhost:8080/api/users'
var changeUserStatusUrl	= 'http://localhost:8080/api/users/{username}/status/{status}'
var userCoinsUrl		= 'http://localhost:8080/api/users/me/coins'
var userPasswordUrl		= 'http://localhost:8080/api/users/me/password'

var seed = new Date().toISOString().replace(/[^0-9]/g, "")

var blockedUser = {
	username: 'BU' + seed,
	password: 'BU' + seed,
	email: 'bu@b' + seed
}

var adminJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlck5hbWUiOiJhZG1pbiIsInBhc3N3b3JkIjoiYWRtaW4iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE0NjY5NjcxNzB9.9i9fat_6R0ghQwc2KedUweblCVKYBKr-etp4jK5Vzrc'

describe('as blocked user', function() {

	var blockedUserJwt
	
	before(function() {
		server = require('../server.js')
	})
	
	it('should create his account', function() {
		var response = chakram.post(usersUrl, blockedUser)
		expect(response).to.have.status(202)
		return chakram.wait()
	})
	
	it('an admin user can activate the user account', function() {
		var url = changeUserStatusUrl.replace('{username}', blockedUser.username).replace('{status}', 4)
		var response = chakram.put(url, {}, {
			headers: {
				authorization: 'Bearer ' + adminJwt
			}
		})
		expect(response).to.have.status(204)
		return chakram.wait()
	})
	
	it('should login with local authentication', function() {
		return testLoginLocal(blockedUser)
		.then(function(jwt) {
			expect(jwt).to.be.ok
			expect(jwt).to.be.a('string')
			blockedUserJwt = jwt
		})
	})
	
	it('an admin user can block the user account', function() {
		var url = changeUserStatusUrl.replace('{username}', blockedUser.username).replace('{status}', 2)
		var response = chakram.put(url, {}, {
			headers: {
				authorization: 'Bearer ' + adminJwt
			}
		})
		expect(response).to.have.status(204)
		return chakram.wait()
	})
	
	it('should not get access to his coins', function() {
		var response = chakram.get(userCoinsUrl, {
			headers: {
				authorization: 'Bearer ' + blockedUserJwt
			}
		})
		expect(response).to.have.status(403)
		return chakram.wait()
	})
	
	it('should not update his password', function() {
		var newPassword = 'new' + blockedUser.password
		var response = chakram.put(userPasswordUrl, {
			password: newPassword
		}, {
			headers: {
				authorization: 'Bearer ' + blockedUserJwt
			}
		})
		expect(response).to.have.status(403)
		return chakram.wait()
	})
	
})