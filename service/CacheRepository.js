var Memcached = require('memcached');
var AppConfig    = require('../AppConfig');
var CacheConfig    = require('../CacheConfig');



var getCache = function(){
	return global.cacheConnection;
};

var connect = function(){
	return new Memcached(CacheConfig.endpoint);
};

var getExchangeData = function(callback){
	getCache().get(CacheConfig.exchange.key, callback);
}

var storeExchangeData = function(data){
	getCache().set(CacheConfig.exchange.key, data, CacheConfig.exchange.timeout_seconds,
		function(err){
			if ( err ){
				console.log(err);
			}
		});
};

var getBudgetsData = function(callback){
	getCache().get(CacheConfig.budgets.key, callback);
};

var storeBudgetsData = function(data){
	console.log('Storing budgets data now.');
	getCache().set(CacheConfig.budgets.key, data, CacheConfig.budgets.timeout_seconds,
		function(err){
			if ( err ){
				console.log(err);
			}
		});
};

var getMasternodeHistory = function(callback){
	getCache().get(CacheConfig.masternodes.history.key, callback);
};

var storeMasternodeHistory = function(data){
	console.log('Storing masternode history data now.');
	getCache().set(CacheConfig.masternodes.history.key, data, CacheConfig.masternodes.history.timeout_seconds,
		function(err){
			if ( err ){
				console.log(err);
			}
		});
};

var getLatestBlocks = function(callback){
	getCache().get(CacheConfig.chain.blocks.key, callback);
};

var storeLatestBlocks = function(data){
	console.log('Storing latest blocks now.');
	getCache().set(CacheConfig.chain.blocks.key, data, CacheConfig.chain.blocks.timeout_seconds,
		function(err){
			if ( err ){
				console.log(err);
			}
		});
};

var getMasternodeStats = function(callback){
	getCache().get(CacheConfig.masternodes.stats.key, callback);
};

var storeMasternodeStats = function(data){
	console.log('Storing latest blocks now.');
	getCache().set(CacheConfig.masternodes.stats.key, data, CacheConfig.masternodes.stats.timeout_seconds,
		function(err){
			if ( err ){
				console.log(err);
			}
		});
};

module.exports = {
	connect: connect,
	getExchangeData: getExchangeData,
	storeExchangeData: storeExchangeData,
	getBudgetsData: getBudgetsData,
	storeBudgetsData: storeBudgetsData,
	getMasternodeHistory: getMasternodeHistory,
	storeMasternodeHistory: storeMasternodeHistory,
	getLatestBlocks: getLatestBlocks,
	storeLatestBlocks: storeLatestBlocks,
	getMasternodeStats: getMasternodeStats,
	storeMasternodeStats: storeMasternodeStats
};