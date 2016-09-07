var testLoginLocal = require('./test-login-local')
var chakram	= require('chakram')
var expect 	= chakram.expect

var usersUrl			= 'http://localhost:8080/api/users'
var changeUserStatusUrl	= 'http://localhost:8080/api/users/{username}/status/{status}'
var userCoinsUrl		= 'http://localhost:8080/api/users/me/coins'
var userPasswordUrl		= 'http://localhost:8080/api/users/me/password'
var userBidsUrl			= 'http://localhost:8080/api/users/me/auctions/{auctionid}/bids'
var userFriendsUrl		= 'http://localhost:8080/api/users/me/auctions/{auctionid}/friends'
var userPackageUrl		= 'http://localhost:8080/api/users/me/packages/{packageid}'

var seed = new Date().toISOString().replace(/[^0-9]/g, "")
var newUser = {
	username: 'NU' + seed,
	password: 'NP' + seed,
	email: 'na@a' + seed
}
var userRepeatedUserName = {
	username: 'NU' + seed,
	password: 'NP' + seed,
	email: 'nr@r' + seed
}
var userRepeatedEmail = {
	username: 'NR' + seed,
	password: 'NP' + seed,
	email: 'na@a' + seed
}
var otherUser = {
	username: 'NO' + seed,
	password: 'NO' + seed,
	email: 'no@o' + seed
}

var adminJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlck5hbWUiOiJhZG1pbiIsInBhc3N3b3JkIjoiYWRtaW4iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE0NjY5NjcxNzB9.9i9fat_6R0ghQwc2KedUweblCVKYBKr-etp4jK5Vzrc'

describe('as user', function() {
	
	var server, userAuthorizedJwt, userWrongPasswordJwt
	
	before(function() {
		server = require('../server.js')
	})
	
	it('should create his account', function() {
		var response = chakram.post(usersUrl, newUser)
		expect(response).to.have.status(202)
		var response = chakram.post(usersUrl, otherUser)
		return chakram.wait()
	})
	
	it('should not create a user with a repeated username', function() {
		var response = chakram.post(usersUrl, userRepeatedUserName)
		expect(response).to.have.status(400)
		return chakram.wait()
	})
	
	it('should not create a user with a repeated email', function() {
		var response = chakram.post(usersUrl, userRepeatedEmail)
		expect(response).to.have.status(422)
		return chakram.wait()
	})
	
	it('should not login with local authentication if the user was not activated', function() {
		return testLoginLocal(newUser)
		.then(function(jwt) {
			expect(jwt).to.not.be.ok
		})
	})
	
	it('an admin user can activate the user account', function() {
		var url = changeUserStatusUrl.replace('{username}', newUser.username).replace('{status}', 4)
		var response = chakram.put(url, {}, {
			headers: {
				authorization: 'Bearer ' + adminJwt
			}
		})
		expect(response).to.have.status(204)
		var url = changeUserStatusUrl.replace('{username}', otherUser.username).replace('{status}', 4)
		var response = chakram.put(url, {}, {
			headers: {
				authorization: 'Bearer ' + adminJwt
			}
		})
		return chakram.wait()
	})
	
	it('should login with local authentication', function() {
		return testLoginLocal(newUser)
		.then(function(jwt) {
			expect(jwt).to.be.ok
			expect(jwt).to.be.a('string')
			userAuthorizedJwt = jwt
		})
	})
	
	it("should not change his account status", function() {
		var url = changeUserStatusUrl.replace('{username}', newUser.username).replace('{status}', 4)
		var response = chakram.put(url, {}, {
			headers: {
				authorization: 'Bearer ' + userAuthorizedJwt
			}
		})
		expect(response).to.have.status(403)
		return chakram.wait()
	})
	
	it('can update his password', function() {
		var newPassword = 'new' + newUser.password
		var response = chakram.put(userPasswordUrl, {
			password: newPassword
		}, {
			headers: {
				authorization: 'Bearer ' + userAuthorizedJwt
			}
		})
		expect(response).to.have.status(201)
		.then(function(response) {
			expect(response.body).to.be.a('string')
			userWrongPasswordJwt = userAuthorizedJwt
			userAuthorizedJwt = response.body
		})
		return chakram.wait()
	})
	
	describe("the bids", function() {

		it('can be created', function() {
			var url = userBidsUrl.replace('{auctionid}', 1)
			var response = chakram.post(url, {
				amount: 100
			}, {
				headers: {
					Authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(201)
			return chakram.wait()
		})
		
		it('can not be created without an amount', function() {
			var url = userBidsUrl.replace('{auctionid}', 1)
			var response = chakram.post(url, {}, {
				headers: {
					Authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(400)
			return chakram.wait()
		})
		
		it('can not be created with a wrong auctionid', function() {
			var url = userBidsUrl.replace('{auctionid}', 'xxx')
			var response = chakram.post(url, {
				amount: 100
			}, {
				headers: {
					Authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(404)
			return chakram.wait()
		})

		it('can not be created without auth', function() {
			var url = userBidsUrl.replace('{auctionid}', 1)
			var response = chakram.post(url, {
				amount: 100
			})
			expect(response).to.have.status(401)
			return chakram.wait()
		})
		
		it('can not be created a string amount', function() {
			var url = userBidsUrl.replace('{auctionid}', 1)
			var response = chakram.post(url, {
				amount: 'xxx'
			}, {
				headers: {
					Authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(400)
			return chakram.wait()
		})

		it('can not created a number + string amount', function() {
			var url = userBidsUrl.replace('{auctionid}', 1)
			var response = chakram.post(url, {
				amount: '23xxx'
			}, {
				headers: {
					Authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(400)
			return chakram.wait()
		})
		
		it('the user can get his own bids', function() {
			var url = userBidsUrl.replace('{auctionid}', 1)	+ '?start=4&end=8'
			var response = chakram.get(url, {
				headers: {
					Authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(200)
			return chakram.wait()
		})
		
		it('the user can not get the bids with a wrong start', function() {
			var url = userBidsUrl.replace('{auctionid}', 1)	+ '?start=xxx&end=8'
			var response = chakram.get(url, {
				headers: {
					Authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(400)
			return chakram.wait()
		})
		
		it('the user can not get the bids with a wrong end', function() {
			var url = userBidsUrl.replace('{auctionid}', 1)	+ '?start=5&end=ttt'
			var response = chakram.get(url, {
				headers: {
					Authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(400)
			return chakram.wait()
		})
		
		it('the user can not get the bids with a wrong auctionid', function() {
			var url = userBidsUrl.replace('{auctionid}', 'xxx')	+ '?start=4&end=8'
			var response = chakram.get(url, {
				headers: {
					Authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(404)
			return chakram.wait()
		})
	})
	
	describe('the coins', function() {
		
		it('can be getted', function() {
			var response = chakram.get(userCoinsUrl, {
				headers: {
					authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(200)
			return chakram.wait()
		})
		
		it("the user can't get his coins with wrong password", function() {
			var response = chakram.get(userCoinsUrl, {
				headers: {
					authorization: 'Bearer ' + userWrongPasswordJwt
				}
			})
			expect(response).to.have.status(401)
			return chakram.wait()
		})
		
		it("the user can't get his coins without authenticate", function() {
			var response = chakram.get(userCoinsUrl, {})
			expect(response).to.have.status(401)
			return chakram.wait()
		})
	})
	
	describe('Friends -', function() {
		it('The user can get his friends', function() {
			var url = userFriendsUrl.replace('{auctionid}', 1) + '?start=4&end=8'
			var response = chakram.get(url, {
				headers: {
					authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(200)
			return chakram.wait()
		})
		
		it('The user can not get his friends with wrong start', function() {
			var url = userFriendsUrl.replace('{auctionid}', 1) + '?start=xxx&end=8'
			var response = chakram.get(url, {
				headers: {
					authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(400)
			return chakram.wait()
		})
		
		it('The user can not get his friends with wrong end', function() {
			var url = userFriendsUrl.replace('{auctionid}', 1) + '?start=4&end=xxx'
			var response = chakram.get(url, {
				headers: {
					authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(400)
			return chakram.wait()
		})
		
		it('The user can not get his friends with wrong auctionid', function() {
			var url = userFriendsUrl.replace('{auctionid}', 'xxx') + '?start=4&end=8'
			var response = chakram.get(url, {
				headers: {
					authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(404)
			return chakram.wait()
		})
	})
	
	describe('Package -', function() {
		it('the user can get his packages', function() {
			var url = userPackageUrl.replace('{packageid}', 12)
			var response = chakram.get(url, {
				headers: {
					authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(200)
			return chakram.wait()
		})
		
		it('the user can not get his packages without authentication', function() {
			var url = userPackageUrl.replace('{packageid}', 12)
			var response = chakram.get(url)
			expect(response).to.have.status(401)
			return chakram.wait()
		})
		
		it('the user can not get his packages with String id', function() {
			var url = userPackageUrl.replace('{packageid}', 'xxx')
			var response = chakram.get(url, {
				headers: {
					authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(404)
			return chakram.wait()
		})
		
		it('the user can not get his packages with number + String id', function() {
			var url = userPackageUrl.replace('{packageid}', '23XXX')
			var response = chakram.get(url, {
				headers: {
					authorization: 'Bearer ' + userAuthorizedJwt
				}
			})
			expect(response).to.have.status(404)
			return chakram.wait()
		})
	})
})