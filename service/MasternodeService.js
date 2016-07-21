var request    = require('request');
var AppConfig  = require('../AppConfig');
var Cache      = require('./CacheRepository');
var Logger     = require('log');

var log = new Logger(AppConfig.logLevel);


var fetchData = function(source, url, callback){

	request.get(url, function (err, response, body) {
		if ( !err && response.statusCode == 200 ){
			try {
	            callback(null, JSON.parse(body));
	        }catch (e) {
	            return callback('ERROR parsing response from ' + source + '. Details: ' + e + '\nResponse::' + body);
	        }
		}else if ( err ){
            return callback('ERROR: fetching data from ' + source + ' (' + url + ') Details: ' + err, null);
        }else{
        	return callback('ERROR: unexpected response code (' + response.statusCode + ') from url=[' + url + '] Details: ' + body);
        }
	});
};

var fetchMasternodeHistory = function(callback){

	Cache.getMasternodeHistory(function(err, data){
		if ( err ){
			callback(err);
		}else{
			
			if ( data === undefined ){
				
				log.debug('Masternode history not found in cache.');
				log.debug('Fetching masternode history from ' + AppConfig.masternodes.node40.name + ' at ' + AppConfig.masternodes.node40.historyUrl);

				fetchData(AppConfig.masternodes.node40.name, AppConfig.masternodes.node40.historyUrl, function(err, results){
					if ( err ){
						callback(err,results);
					}else{
						Cache.storeMasternodeHistory(results);
						callback(err,results);
					}
				});
			}else{
				log.debug('Using masternode history from cache.');
				callback(null, data);
			}
		}
	});	
};

var fetchMasternodeStats = function(callback){

	Cache.getMasternodeStats(function(err, data){
		if ( err ){
			callback(err);
		}else{
			
			if ( data === undefined ){

				log.debug('Masternode stats not found in cache.');
				log.debug('Fetching masternode stats from ' + AppConfig.masternodes.node40.name + ' at ' + AppConfig.masternodes.node40.statsUrl);

				fetchData(AppConfig.masternodes.node40.name, AppConfig.masternodes.node40.statsUrl, function(err, results){
					if ( err ){
						callback(err,results);
					}else{
						Cache.storeMasternodeStats(results);
						callback(err,results);
					}
				});
			}else{
				log.debug('Using masternode stats from cache.');
				callback(null, data);
			}
		}
	});	
};

module.exports = {
	fetchMasternodeHistory: fetchMasternodeHistory,
	fetchMasternodeStats: fetchMasternodeStats
};