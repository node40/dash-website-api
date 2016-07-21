var Memcached   = require('memcached');
var AppConfig   = require('../AppConfig');
var CacheConfig = require('../CacheConfig');
var Logger      = require('log');

var log = new Logger(AppConfig.logLevel);

var getCache = function(){
	return global.cacheConnection;
};

var connect = function(){
	return global.cacheConnection === undefined ? new Memcached(CacheConfig.endpoint) : global.cacheConnection;
};

var getExchangeData = function(callback){
	getCache().get(CacheConfig.exchange.key, callback);
}

var storeExchangeData = function(data){
	log.debug('Storing exchange data in cache.');
	getCache().set(CacheConfig.exchange.key, data, CacheConfig.exchange.timeout_seconds,
		function(err){
			if ( err ){
				log.error(err);
			}
		});
};

var getBudgetsData = function(callback){
	getCache().get(CacheConfig.budgets.key, callback);
};

var storeBudgetsData = function(data){
	log.debug('Storing budgets data in cache.');
	getCache().set(CacheConfig.budgets.key, data, CacheConfig.budgets.timeout_seconds,
		function(err){
			if ( err ){
				log.error(err);
			}
		});
};

var getMasternodeHistory = function(callback){
	getCache().get(CacheConfig.masternodes.history.key, callback);
};

var storeMasternodeHistory = function(data){
	log.debug('Storing masternode history data in cache.');
	getCache().set(CacheConfig.masternodes.history.key, data, CacheConfig.masternodes.history.timeout_seconds,
		function(err){
			if ( err ){
				log.error(err);
			}
		});
};

var getLatestBlocks = function(callback){
	getCache().get(CacheConfig.chain.blocks.key, callback);
};

var storeLatestBlocks = function(data){
	log.debug('Storing latest blocks data in cache.');
	getCache().set(CacheConfig.chain.blocks.key, data, CacheConfig.chain.blocks.timeout_seconds,
		function(err){
			if ( err ){
				log.error(err);
			}
		});
};

var getMasternodeStats = function(callback){
	getCache().get(CacheConfig.masternodes.stats.key, callback);
};

var storeMasternodeStats = function(data){
	log.debug('Storing masternode stats data in cache.');
	getCache().set(CacheConfig.masternodes.stats.key, data, CacheConfig.masternodes.stats.timeout_seconds,
		function(err){
			if ( err ){
				log.error(err);
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