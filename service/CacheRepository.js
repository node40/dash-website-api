var Memcached = require('memcached');
var Config    = require('../Config');

var exchange = {
	key: 'dashapi_exchange',
	timeout_seconds: 10
};

var budgets = {
	key: 'dashapi_budgets_all',
	timeout_seconds: 10
};

var masternodes = {
	history: {
		key: 'dashapi_masternodes_history',
		timeout_seconds: 10
	},
	stats: {
		key: 'dashapi_masternodes_stats',
		timeout_seconds: 10
	}
};

var chain = {
	blocks: {
		key: 'dashapi_chain_latest_blocks',
		timeout_seconds: 10
	}
};

var getCache = function(){
	return global.cacheConnection;
};

var connect = function(){
	return new Memcached('localhost:11211');
};

var getExchangeData = function(callback){
	getCache().get(exchange.key, callback);
}

var storeExchangeData = function(data){
	getCache().set(exchange.key, data, exchange.timeout_seconds,
		function(err){
			if ( err ){
				console.log(err);
			}
		});
};

var getBudgetsData = function(callback){
	getCache().get(budgets.key, callback);
};

var storeBudgetsData = function(data){
	console.log('Storing budgets data now.');
	getCache().set(budgets.key, data, budgets.timeout_seconds,
		function(err){
			if ( err ){
				console.log(err);
			}
		});
};

var getMasternodeHistory = function(callback){
	getCache().get(masternodes.history.key, callback);
};

var storeMasternodeHistory = function(data){
	console.log('Storing masternode history data now.');
	getCache().set(masternodes.history.key, data, masternodes.history.timeout_seconds,
		function(err){
			if ( err ){
				console.log(err);
			}
		});
};

var getLatestBlocks = function(callback){
	getCache().get(chain.blocks.key, callback);
};

var storeLatestBlocks = function(data){
	console.log('Storing latest blocks now.');
	getCache().set(chain.blocks.key, data, chain.blocks.timeout_seconds,
		function(err){
			if ( err ){
				console.log(err);
			}
		});
};

var getMasternodeStats = function(callback){
	getCache().get(masternodes.stats.key, callback);
};

var storeMasternodeStats = function(data){
	console.log('Storing latest blocks now.');
	getCache().set(masternodes.stats.key, data, masternodes.stats.timeout_seconds,
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