var request = require('request');
var Config  = require('../Config');
var Cache   = require('./CacheRepository');


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

var fetchLatestBlocks = function(callback){

	Cache.getLatestBlocks(function(err, data){
		if ( err ){
			callback(err);
		}else{
			
			if ( data === undefined ){

				var url = Config.chain.insight.url + '?limit=' + Config.chain.insight.maxBlocks;

				fetchData(Config.chain.insight.name, url, function(err, results){
					if ( err ){
						callback(err,results);
					}else{
						Cache.storeLatestBlocks(results);
						callback(err,results);
					}
				});
			}else{
				callback(null, data);
			}
		}
	});

	
};

module.exports = {
	fetchLatestBlocks: fetchLatestBlocks
};