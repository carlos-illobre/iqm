var chakram	= require('chakram')
var expect 	= chakram.expect

var auctionsUrl = 'http://localhost:8080/api/auctions'
var auctionUrl  = 'http://localhost:8080/api/auctions/{auctionid}'

describe('Auctions', function() {
	
	before(function() {
		server = require('../server.js')
	})

	it('should get the auctions', function() {
		var response = chakram.get(auctionsUrl + '?start=4&end=8')
		expect(response).to.have.status(200)
		return chakram.wait()
	})
	
	it('should not get the auctions with wrong start', function() {
		var response = chakram.get(auctionsUrl + '?start=xxx&end=8')
		expect(response).to.have.status(400)
		return chakram.wait()
	})
	
	it('should not get the auctions with wrong end', function() {
		var response = chakram.get(auctionsUrl + '?start=4&end=xxx')
		expect(response).to.have.status(400)
		return chakram.wait()
	})
	
	it('should get an auction', function() {
		var response = chakram.get(auctionUrl.replace('{auctionid}', 1))
		expect(response).to.have.status(200)
		return chakram.wait()
	})
	
	it('should not get an auction with wrong id', function() {
		var response = chakram.get(auctionUrl.replace('{auctionid}', 'xxx'))
		expect(response).to.have.status(404)
		return chakram.wait()
	})
})