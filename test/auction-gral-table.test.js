var chakram			= require('chakram')
var expect 			= chakram.expect

var gralTableUrl = 'http://localhost:8080/api/auctions/{auctionid}/graltable'

describe('Auction Gral Table', function() {
	
	before(function() {
		server = require('../server.js')
	})
	
	it('should get the graltable', function() {
		var url = gralTableUrl
			.replace('{auctionid}', 1)
			+ '?start=4&end=8'
		var response = chakram.get(url)
		expect(response).to.have.status(200)
		return chakram.wait()
	})
	
	it('should not get the graltable with wrong start', function() {
		var url = gralTableUrl
			.replace('{auctionid}', 1)
			+ '?start=xxx&end=8'
		var response = chakram.get(url)
		expect(response).to.have.status(400)
		return chakram.wait()
	})
	
	it('should not get the graltable with wrong end', function() {
		var url = gralTableUrl
			.replace('{auctionid}', 1)
			+ '?start=5&end=xxx'
		var response = chakram.get(url)
		expect(response).to.have.status(400)
		return chakram.wait()
	})
	
	it('should not get the graltable with wrong auctionid', function() {
		var url = gralTableUrl
			.replace('{auctionid}', 'xxx')
			+ '?start=4&end=8'
		var response = chakram.get(url)
		expect(response).to.have.status(404)
		return chakram.wait()
	})
})