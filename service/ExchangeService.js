var request    = require('request');
var Async      = require('async');
var AppConfig  = require('../AppConfig');
var Cache      = require('./CacheRepository');
var Logger     = require('log');

var log = new Logger(AppConfig.logLevel);


var fetchExchangeData = function(exchange, url, callback){
	request.get(url, function (err, response, body) {
		if ( !err && response.statusCode == 200 ){
			try {
	            callback(null, JSON.parse(body));
	        }catch (e) {
	            return callback('ERROR parsing response from ' + exchange + '. Details: ' + e + '\nResponse::' + body);
	        }
		}else if ( err ){
            return callback('ERROR: fetching data from ' + exchange + ' (' + url + ') Details: ' + err + '. BODY=' + body, null);
        }else{
        	return callback('ERROR: unexpected response code (' + response.statusCode + ') from url=[' + url + '] Details: ' + body);
        }
	});
};

var fetchFromCoinCap = function(callback){
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.coincap.name + ' at ' + AppConfig.exchanges.coincap.url);
	fetchExchangeData(AppConfig.exchanges.coincap.name, AppConfig.exchanges.coincap.url, function(err, result){
		if ( err ){
			callback(err);
		}else{
			var data = {
				exchange: AppConfig.exchanges.coincap.name,
				url: AppConfig.exchanges.coincap.orgUrl,
				price: result[0].price_usd,
				volume: result[0]['24h_volume_usd'],
				percent_change: result[0].percent_change_24h
			};
			callback(null, data);
		}
	});
};

var fetchFromWorldCoinIndex = function(callback){

	var url = AppConfig.exchanges.worldcoin.url + '?key=' + AppConfig.exchanges.worldcoin.apiKey

	log.debug('Fetching exchange data from ' + AppConfig.exchanges.worldcoin.name + ' at ' + url);

	fetchExchangeData(AppConfig.exchanges.worldcoin.name, url, function(err, result){
		if ( err ){
			callback(err);
		}else{
			var dashResults = result.Markets.find(function (market) {
		        return market.Name === "Dash";
		    });
		    if ( dashResults ){
		    	var data = {
		    		exchange: AppConfig.exchanges.worldcoin.name,
					url: AppConfig.exchanges.worldcoin.orgUrl,
					price: dashResults.Price_usd,
					volume: dashResults.Volume_24h,
					percent_change: -1
		    	};
		    	callback(null, data);
		    }else{
		    	callback('Unable to find the Dash Market data in the response from WorldCoinIndex. Endpoint is [' + url + ']');
		    }
			
		}
	});
};

var fetchAll = function(callback){
	var callstack = [];

	Cache.getExchangeData(function(err, data){
		if ( err ){
			callback(err);
		}else{
			
			if ( data === undefined ){

				log.debug('Latest exchange data not found in cache.');

				callstack.push(fetchFromWorldCoinIndex);
				callstack.push(fetchFromCoinCap);

				Async.parallel(callstack, function(err, result){
					Cache.storeExchangeData(result);
					callback(err,result);
				});

			}else{
				log.debug('Using exchange data found in cache.');
				callback(null,data);
			}
		}
	});
	
	
};

module.exports = {
	fetchFromCoinCap: fetchFromCoinCap,
	fetchFromWorldCoinIndex: fetchFromWorldCoinIndex,
	fetchAll: fetchAll
}