var phantom 	= require('phantom')
var chaiExpect 	= require('chai').expect
var chakram	= require('chakram')
var expect 	= chakram.expect

var url = 'http://localhost:8080/auth/googleplus'
var changeUserStatusUrl	= 'http://localhost:8080/api/users/{username}/status/{status}'
var userCoinsUrl		= 'http://localhost:8080/api/users/me/coins'
var userPasswordUrl		= 'http://localhost:8080/api/users/me/password'
var userBidsUrl			= 'http://localhost:8080/api/users/me/auctions/{auctionid}/bids'
var userFriendsUrl		= 'http://localhost:8080/api/users/me/auctions/{auctionid}/friends'
var userPackageUrl		= 'http://localhost:8080/api/users/me/packages/{packageid}'

var seed = new Date().toISOString().replace(/[^0-9]/g, "")

var user = {
	username: '10595382883215465797',
	email: 'test.qdm@gmail.com',
	password: 'passtestqdm'
}

var userWrongPasswordJwt = 

module.exports = login

function login(url, user) {
	var page, ph

	return phantom
	.create()
	.then(function(instance) {
		ph = instance
		return instance.createPage()
	})
	.then(function(sitepage) {
		page = sitepage
		return page.open(url)
	})		
	.then(function(status) {
		console.log('Enter email')
		chaiExpect(status).to.equal('success')
		return page.render('test/google/1-enter-email.png')
	})
	.then(function() {
		return page.evaluate(function(user) {
			document.getElementById('Email').value = user.email
			document.getElementById('gaia_loginform').submit()
		}, user)
	})
	.then(function(result) {
		return waitPageLoadFinished(page)
	})
	.then(function(status) {
		console.log('Enter password')
		chaiExpect(status).to.equal('success')
		return page.render('test/google/2-enter-password.png')
	})
	.then(function() {
		return page.evaluate(function(user) {
			document.getElementById('Passwd').value = user.password
			document.getElementById('gaia_loginform').submit()
		}, user)
	})
	.then(function(result) {
		return waitPageLoadFinished(page)
	})
	.then(function(status) {
		console.log('Please wait')
		chaiExpect(status).to.equal('success')
		return page.render('test/google/3-please-wait.png')
	})
	.then(function(result) {
		return waitPageLoadFinished(page)
	})
	.then(function(status) {
		console.log('Click allow')
		chaiExpect(status).to.equal('success')
		return page.render('test/google/4-click-allow.png')
	})
	.then(function() {
		console.log('Wait 5 secods to enable allow button')
		return new Promise(function(resolve, reject) {
			setTimeout(function() {
				resolve()
			}, 5000)
		})
	})
	.then(function() {
		return page.evaluate(function() {
			document.getElementById('submit_approve_access').click()
		})
	})
	.then(function(result) {
		return waitPageLoadFinished(page)
	})
	.then(function(status) {
		console.log('Redirect')
		chaiExpect(status).to.equal('success')
		return page.render('test/google/5-redirect.png')
	})
	.then(function() {
		return page.evaluate(function(getQueryString) {
			return getQueryString('jwt')
		}, getQueryString)
	})
	.then(function(jwt) {
		console.log('Get jwt')
		chaiExpect(jwt).to.be.ok
		page.close()
		ph.exit()
		return jwt
	})
	.catch(function(error) {
		ph.exit()
		throw error
	})
}

function getQueryString(name) {
	name = name.replace(/[\[\]]/g, "\\$&")
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(window.location.href)
	if (!results) return null
	if (!results[2]) return ''
	return decodeURIComponent(results[2].replace(/\+/g, " "))
}

function waitPageLoadFinished(page) {
	return new Promise(function(resolve, reject) {
		page.on('onLoadFinished', function(status) {
			resolve(status)
		})
	})
}

describe('Google+ Login', function() {
	
	this.timeout(100000)
	
	var server, userAuthorizedJwt
	
	before(function() {
		server = require('../server.js')
	})
	
	it('should redirect with jwt query string', function() {
		return login(url, user)
		.then(function(jwt) {
			userAuthorizedJwt = jwt
		})
	})
	
	it('can update his password', function() {
		var newPassword = 'new' + seed
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