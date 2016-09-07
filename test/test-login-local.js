var phantom 	= require('phantom')
var chaiExpect 	= require('chai').expect

module.exports = function(user) {
	var page, ph
	
	return phantom
	.create()
	.then(function(instance) {
		ph = instance
		return instance.createPage()
	})
	.then(function(sitepage) {
		page = sitepage
		return page.open('http://localhost:8080')
	})
	.then(function() {
		return page.evaluate(function(user) {
			document.getElementById('username').value = user.username
			document.getElementById('password').value = user.password
			document.getElementById('login').submit()
		}, user)
	})
	.then(function(result) {
		return waitPageLoadFinished(page)
	})
	.then(function(status) {
		chaiExpect(status).to.equal('success')
		return page.evaluate(function(getQueryString) {
			return getQueryString('jwt')
		}, getQueryString)
	})
	.then(function(jwt) {
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