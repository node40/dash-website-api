var request = require('request');
var Config  = require('../Config');
var Cache   = require('./CacheRepository');

var fetchBudgetsData = function(budgetSource, url, callback){

	request.get(url, function (err, response, body) {
		if ( !err && response.statusCode == 200 ){

			try {
	            callback(null, JSON.parse(body));
	        }catch (e) {
	            return callback('ERROR parsing response from ' + budgetSource + '. Details: ' + e + '\nResponse::' + body, null);
	        }

		}else if ( err ){
            return callback('ERROR: fetching data from ' + budgetSource + ' (' + url + ') Details: ' + err, null);
        }else{
        	return callback('ERROR: unexpected response code (' + response.statusCode + ') from url=[' + url + '] Details: ' + body, null);
        }
	});
};

var fetchDashBudgetsData = function(callback){

	Cache.getBudgetsData(function(err, data){
		if ( err ){
			callback(err);
		}else{

			if ( data === undefined ){
				fetchBudgetsData(Config.budgets.dashwhale.name, Config.budgets.dashwhale.url,function(err, results){
					if ( !err ){
						Cache.storeBudgetsData(results);
					}
					callback(err,results);
				});
			}else{
				callback(null, data);
			}
		}
	});
};

module.exports = {
	fetchDashBudgetsData: fetchDashBudgetsData
}