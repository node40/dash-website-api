var request    = require('request');
var Async      = require('async');
var AppConfig  = require('../AppConfig');
var Cache      = require('./CacheRepository');
var Logger     = require('log');
var krwUsd     = null;
var log = new Logger(AppConfig.logLevel);

var createErrorExtension = function(message, exchange, errortype){
	var errorObject = new Error();
		errorObject.message = message;
		errorObject.exchange = exchange;
		errorObject.errorType = errortype;
	return errorObject;
}
var fetchExchangeData = function(exchange, url, callback){
	request.get(url, function (err, response, body) {
		if ( err ){
			var errorFetching = 'ERROR: fetching data from ';
			log.debug(errorFetching + exchange + ' (' + url + ') Details: ' + err + '. BODY=' + body, null);
			callback(createErrorExtension(errorFetching, exchange, err), null);
			return;
		}
		if (response.statusCode !== 200){
			var unexpectedError = 'ERROR: unexpected response code ';
			log.debug( unexpectedError + '(' + response.statusCode + ') from url=[' + url + '] Details: ' + body );
			callback(createErrorExtension( unexpectedError, url, response.statusCode), null);
			return;
		}
		var data;
		try {
			data = JSON.parse(body);
		}catch (e){
			var parseError = 'ERROR parsing response from ';
			log.debug(parseError + exchange + '. Details: ' + e + '\nResponse::' + body);
			callback(createErrorExtension(parseError, exchange, e), null);
			return;
		}
		callback(null, data);
		return
	});
};

var fetchFromCoinCap = function(callback){
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.coincap.name + ' at ' + AppConfig.exchanges.coincap.url);
	fetchExchangeData(AppConfig.exchanges.coincap.name, AppConfig.exchanges.coincap.url, function(err, result){
		if ( err ){
			callback(err);
			return;
		}
		if (result === null) {
			callback(null, null);
			return
		}
		var data = {
			exchange: AppConfig.exchanges.coincap.name,
			url: AppConfig.exchanges.coincap.orgUrl,
			price: parseFloat(result[0].price_usd),
			volume: parseFloat(result[0]['24h_volume_usd']),
			percent_change: parseFloat(result[0].percent_change_24h),
			market_cap: parseFloat(result[0].market_cap_usd)
		};
		callback(null, data);
		return;
	});
};

var fetchFromCoinCapBtc = function(callback){
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.coincapbtc.name + ' at ' + AppConfig.exchanges.coincapbtc.url);
	fetchExchangeData(AppConfig.exchanges.coincapbtc.name, AppConfig.exchanges.coincapbtc.url, function(err, result){
		if ( err ){
			callback(err);
			return;
		}
		if (result === null) {
			callback(null, null);
			return;
		}
		btcPrice = parseFloat(result[0].price_usd);
		var data ={
			exchange: AppConfig.exchanges.coincapbtc.name,
			url: AppConfig.exchanges.coincapbtc.orgUrl,
			btcPrice: btcPrice
		}
		callback(null, data);
		return;
	});
};

var fetchFromWorldCoinIndex = function(callback){

	var url = AppConfig.exchanges.worldcoin.url + '?key=' + AppConfig.exchanges.worldcoin.apiKey

	log.debug('Fetching exchange data from ' + AppConfig.exchanges.worldcoin.name + ' at ' + url);

	fetchExchangeData(AppConfig.exchanges.worldcoin.name, url, function(err, result){
		if ( err ){
			callback(err);
			return;
		} 
		if (result === null) {
			callback(null, null);
			return;
		}
		var dashResults = result.Markets.find(function (market) {
			return market.Name === "Dash";
		});
		if ( dashResults ){
			var data = {
				exchange: AppConfig.exchanges.worldcoin.name,
				url: AppConfig.exchanges.worldcoin.orgUrl,
				price: parseFloat(dashResults.Price_usd),
				volume: parseFloat(dashResults.Volume_24h),
				percent_change: -1
			};
			callback(null, data);
			return;
		}
		callback('Unable to find the Dash Market data in the response from WorldCoinIndex. Endpoint is [' + url + ']');
		return;
	});
};

var fetchFromKraken = function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.kraken.name + ' at ' + AppConfig.exchanges.kraken.url);
	fetchExchangeData(AppConfig.exchanges.kraken.name, AppConfig.exchanges.kraken.url, function(err, result){
		if ( err ){
			callback(err);
			return;
		}
		if (result === null) {
			callback(null, null);
			return;
		}
		data = {
			exchange: AppConfig.exchanges.kraken.name,
			url: AppConfig.exchanges.kraken.orgUrl,
			price: parseFloat(result.result.DASHUSD.c['0'])
		};
		data.volume = result.result.DASHUSD.v[1]*data.price;
		fetchExchangeData(AppConfig.exchanges.kraken.name, AppConfig.exchanges.kraken.urlEur, function(err, result){
			if ( err ){
				callback(err);
				return
			}
			if (result === null) {
				callback(null, null);
				return;
			}
			data['price_eur'] = parseFloat(result.result.DASHEUR.c[0]);
			fetchExchangeData(AppConfig.exchanges.kraken.name, AppConfig.exchanges.kraken.urlBTC, function(err, result){
				if ( err ){
					callback(err);
					return;
				}
				data['price_btc'] = parseFloat(result.result.DASHXBT.c[0]);
				callback(null, data);
				return;
			});
		});
	});
};

var fetchFromPoloniex = function(callback){
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.poloniex.name + ' at ' + AppConfig.exchanges.poloniex.url);
	fetchExchangeData(AppConfig.exchanges.poloniex.name, AppConfig.exchanges.poloniex.url, function(err, result){
		if ( err ){
			callback(err);
			return;
		}
		if (result === null) {
			callback(null, null);
			return;
		}
		var data = {
			exchange: AppConfig.exchanges.poloniex.name,
			url: AppConfig.exchanges.poloniex.orgUrl,
			price_btc: parseFloat(result.BTC_DASH.last)
		};
		callback(null, data);
		return;
	});
};

var fetchFromBittrex= function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.bittrex.name + ' at ' + AppConfig.exchanges.bittrex.url);
	fetchExchangeData(AppConfig.exchanges.bittrex.name, AppConfig.exchanges.bittrex.url, function(err, result){
		if ( err ){
			callback(err);
			return;
		}
		if (result === null) {
			callback(null, null);
			return;
		}
		data = {
			exchange: AppConfig.exchanges.bittrex.name,
			url: AppConfig.exchanges.bittrex.orgUrl,
			price_btc: parseFloat(result.result[0].Last)
		};
		data.volume = result.result[0].Volume*data.price_btc;
		//fetching ETH price
		fetchExchangeData(AppConfig.exchanges.bittrex.name, AppConfig.exchanges.bittrex.urlEth, function(err, result){
			if ( err ){
				callback(err);
				return;
			}
			if (result === null) {
				callback(null, null);
				return;
			}
			data['price_eth'] = parseFloat(result.result[0].Last);
			callback(null, data);
			return;
		});
	});

};

var fetchFromBitfinex = function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.bitfinex.name + ' at ' + AppConfig.exchanges.bitfinex.url);
	fetchExchangeData(AppConfig.exchanges.bitfinex.name, AppConfig.exchanges.bitfinex.url, function(err, result){
		if ( err ){
			callback(err);
			return;
		}
		if (result === null) {
			callback(null, null);
			return;
		}
		data = {
			exchange: AppConfig.exchanges.bitfinex.name,
			url: AppConfig.exchanges.bitfinex.orgUrl,
			price: parseFloat(result.last_price)
		};
		data.volume = result.volume*data.price;
		//fetching BTC price
		fetchExchangeData(AppConfig.exchanges.bitfinex.name, AppConfig.exchanges.bitfinex.urlBTC, function(err, result){
			if ( err ){
				callback(err);
				return;
			}
			if (result === null) {
				callback(null, null);
				return;
			}
			data['price_btc'] = parseFloat(result.last_price);
			callback(null, data);
			return;
		});
	});

};

var fetchFromHitbtc= function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.hitbtc.name + ' at ' + AppConfig.exchanges.hitbtc.url);
	fetchExchangeData(AppConfig.exchanges.hitbtc.name, AppConfig.exchanges.hitbtc.url, function(err, result){
		if ( err ){
			callback(err);
			return;
		}
		if (result === null) {
			callback(null, null);
			return;
		}
		data = {
			exchange: AppConfig.exchanges.hitbtc.name,
			url: AppConfig.exchanges.hitbtc.orgUrl,
			price: parseFloat(result.last)
		};
		data.volume = result.volume*data.price;
		//Fetch BTC
		fetchExchangeData(AppConfig.exchanges.hitbtc.name, AppConfig.exchanges.hitbtc.urlBTC, function(err, result){
			if ( err ){
				callback(err);
				return;
			}
			data['price_btc'] = parseFloat(result.last);
			callback(null, data);
			return;
		});
	});

};

var fetchFromLivecoin= function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.livecoin.name + ' at ' + AppConfig.exchanges.livecoin.url);
	fetchExchangeData(AppConfig.exchanges.livecoin.name, AppConfig.exchanges.livecoin.url, function(err, result){
		if ( err ){
			callback(err);
			return
		}
		if (result === null) {
			callback(null, null);
			return;
		}
		data = {
			exchange: AppConfig.exchanges.livecoin.name,
			url: AppConfig.exchanges.livecoin.orgUrl,
			price: parseFloat(result.last)
		};
		data.volume = result.volume*data.price
		// Fetching BTC price
		fetchExchangeData(AppConfig.exchanges.livecoin.name, AppConfig.exchanges.livecoin.urlBTC, function(err, result){
			if ( err ){
				callback(err);
			}
			if (result === null) {
				callback(null, null);
				return;
			}
			data['price_btc'] = parseFloat(result.last);
			callback(null, data);
			return;
		});
	});
};

var fetchFromExmo= function(callback){
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.exmo.name + ' at ' + AppConfig.exchanges.exmo.url);
	fetchExchangeData(AppConfig.exchanges.exmo.name, AppConfig.exchanges.exmo.url, function(err, result){
		if ( err ){
			callback(err);
			return
		}
		if (result === null) {
			callback(null, null);
			return;
		}
		var data = {
			exchange: AppConfig.exchanges.exmo.name,
			url: AppConfig.exchanges.exmo.orgUrl,
			price: parseFloat(result.DASH_USD.last_trade),
			price_btc: parseFloat(result.DASH_BTC.last_trade),
			volume: parseFloat(result.DASH_USD.vol_curr)
		};
		callback(null, data);
		return;
	});
};

var fetchFromYobit= function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.yobit.name + ' at ' + AppConfig.exchanges.yobit.url);
	fetchExchangeData(AppConfig.exchanges.yobit.name, AppConfig.exchanges.yobit.url, function(err, result){
		if ( err ){
			callback(err);
			return;
		}
		if (result === null) {
			callback(null, null);
			return;
		}
		data = {
			exchange: AppConfig.exchanges.yobit.name,
			url: AppConfig.exchanges.yobit.orgUrl,
			price: parseFloat(result.dash_usd.last)
		};
		data.volume = result.dash_usd.vol*data.price
		fetchExchangeData(AppConfig.exchanges.yobit.name, AppConfig.exchanges.yobit.urlBTC, function(err, result){
			if ( err ){
				callback(err);
				return;
			}
			if (result === null) {
				callback(null, null);
				return;
			}
			data['price_btc'] = parseFloat(result.dash_btc.last);
			fetchExchangeData(AppConfig.exchanges.yobit.name, AppConfig.exchanges.yobit.urlRur, function(err, result){
				if ( err ){
					callback(err);
					return;
				}
				if (result === null) {
					callback(null, null);
					return;
				}
				data['price_rur'] = parseFloat(result.dash_rur.last);
				callback(null, data);
				return;
			});
		});

	});
};

var fetchFromCcex= function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.ccex.name + ' at ' + AppConfig.exchanges.ccex.url);
	fetchExchangeData(AppConfig.exchanges.ccex.name, AppConfig.exchanges.ccex.url, function(err, result){
		if ( err ){
			callback(err);
			return;
		}
		if (result === null) {
			callback(null, null);
			return;
		}
		data = {
			exchange: AppConfig.exchanges.ccex.name,
			url: AppConfig.exchanges.ccex.orgUrl,
			price: parseFloat(result.ticker.lastprice)
		};
		// Fetching BTC price
		fetchExchangeData(AppConfig.exchanges.ccex.name, AppConfig.exchanges.ccex.urlBTC, function(err, result){
			if ( err ){
				callback(err);
				return;
			}
			if (result === null) {
				callback(null, null);
				return;
			}
			data['price_btc'] = parseFloat(result.ticker.lastprice);
			callback(null, data);
			return;
		});
	});

};

var fetchFromCexio= function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.cexio.name + ' at ' + AppConfig.exchanges.cexio.url);
	fetchExchangeData(AppConfig.exchanges.cexio.name, AppConfig.exchanges.cexio.url, function(err, result){
		if ( err ){
			callback(err);
			return;
		}
		if (result === null) {
			callback(null, null);
			return;
		}
		data = {
			exchange: AppConfig.exchanges.cexio.name,
			url: AppConfig.exchanges.cexio.orgUrl,
			price: parseFloat(result.lprice)
		};
		fetchExchangeData(AppConfig.exchanges.cexio.name, AppConfig.exchanges.cexio.urlEur, function(err, result){
			if ( err ){
				callback(err);
				return;
			}
			if (result === null) {
				callback(null, null);
				return;
			}
			data['price_eur'] = parseFloat(result.lprice);
			fetchExchangeData(AppConfig.exchanges.cexio.name, AppConfig.exchanges.cexio.urlBTC, function(err, result){
				if ( err ){
					callback(err);
					return;
				}
				if (result === null) {
					callback(null, null);
					return;
				}
				data['price_btc'] = parseFloat(result.lprice);
				callback(null, data);
				return;
			});
		});

	});


};

var fetchFromBithumb= function(callback){
	fetchExchangeData(AppConfig.exchanges.CurrencyConverterApi.name, AppConfig.exchanges.CurrencyConverterApi.url, function(err, result){
		if ( err ){
			callback(err);
			return;
		}
		if (result === null || result.KRW_USD.val === null) {
			callback(null, null);
			return;
		}
		krwUsd = parseFloat(result.KRW_USD.val);
		fetchExchangeData(AppConfig.exchanges.bithumb.name, AppConfig.exchanges.bithumb.url, function(err, result){
			if ( err ){
				callback(err);
				return;
			}
			if (result === null) {
				callback(null, null);
				return;
			}
			if (!result.data){
				callback(createErrorExtension( 'ERROR: unexpected output format', AppConfig.exchanges.bithumb.url, 'undefined'), null);
				return;
			}
			var data = {
				exchange: AppConfig.exchanges.bithumb.name,
				url: AppConfig.exchanges.bithumb.orgUrl,
				price: result.data.closing_price*krwUsd
			};
			data.volume = result.data.volume_1day*data.price;
			callback(null, data);
			return;
		});
	});
};

var fetchFromBinance= function(callback){
	var data = {};
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.binance.name + ' at ' + AppConfig.exchanges.binance.url);
	fetchExchangeData(AppConfig.exchanges.binance.name, AppConfig.exchanges.binance.url, function(err, result){
		if ( err ){
			callback(err);
			return;
		}
		if (result === null) {
			callback(null, null);
			return;
		}
		var dashBtcTicker = result.find(obj => obj.symbol === "DASHBTC");
		if (dashBtcTicker === undefined ) {
			callback(createErrorExtension( 'ERROR: unexpected output format', AppConfig.exchanges.binance.url, 'undefined'), null);
			return;
		}
		data = {
			exchange: AppConfig.exchanges.binance.name,
			url: AppConfig.exchanges.binance.orgUrl,
			price_btc: parseFloat(dashBtcTicker.price)
		};
		callback(null, data);
		return;
	});
};

var fetchFromCoinroom = function(callback){
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.coinroom.name + ' at ' + AppConfig.exchanges.coinroom.url);
	fetchExchangeData(AppConfig.exchanges.coinroom.name, AppConfig.exchanges.coinroom.url, function(err, result){
		if ( err ){
			callback(err);
			return;
		}
		if (result === null) {
			callback(null, null);
			return;
		}
		var data = {
			exchange: AppConfig.exchanges.coinroom.name,
			url: AppConfig.exchanges.coinroom.orgUrl,
			price: parseFloat(result.last)
		};
		callback(null, data);
		return;
	});
};

var fetchFromHuobi = function(callback){
	log.debug('Fetching exchange data from ' + AppConfig.exchanges.huobi.name + ' at ' + AppConfig.exchanges.huobi.url);
	fetchExchangeData(AppConfig.exchanges.huobi.name, AppConfig.exchanges.huobi.url, function(err, result){
		if ( err ){
			callback(err);
			return;
		}
		if (result === null) {
			callback(null, null);
			return;
		}
		var data = {
			exchange: AppConfig.exchanges.huobi.name,
			url: AppConfig.exchanges.huobi.orgUrl,
			price_btc: parseFloat(result.tick.data[0].price)
		};
		callback(null, data);
		return;
	});
};
var addUsdPrice = function addUsdPrice(arr, btcPrice){
	updatedResult = arr.filter(function(obj) {
		if (!obj){
			return false;
		}
		if(obj.hasOwnProperty("price_btc") && !obj.hasOwnProperty("price")){
			obj.price = obj["price_btc"]*btcPrice;
		}
		return obj != undefined;
	});
	return updatedResult;
};

var fetchAll = function(callback){
	Cache.getExchangeData(function(err, data) {
		if (err) {
			callback(err);
			return;
		}

	if (data !== undefined) {
		log.debug('Using exchange data found in cache.');
		callback(null, data);
		return;
	}

	log.debug('Latest exchange data not found in cache.');
	const callstack = {
		fetchFromCoinCapBtc,
		fetchFromWorldCoinIndex,
		fetchFromCoinCap,
		fetchFromKraken,
		fetchFromBittrex,
		fetchFromBitfinex,
		fetchFromHitbtc,
		fetchFromBithumb,
		fetchFromLivecoin,
		fetchFromExmo,
		fetchFromYobit,
		fetchFromPoloniex,
		fetchFromCcex,
		fetchFromCexio,
		fetchFromBinance,
		fetchFromCoinroom,
		fetchFromHuobi
	};

		Async.parallel(Async.reflectAll(callstack), (err, result)=> {
			// preventing unnecessary wrapper with "value" key
			let resultArray = Object.values(result).map((obj)=> {
				if (obj && obj['value']){
					return obj['value'];
				}
				return obj;
			});

			const { fetchFromCoinCapBtc: coinCapBtc } = result;
			if (coinCapBtc.value && coinCapBtc.value.btcPrice) {
				resultArray = addUsdPrice(resultArray, coinCapBtc.value.btcPrice);
			}

			Cache.storeExchangeData(resultArray);
			callback(null, resultArray);
		});
	});
};

module.exports = {
	fetchFromCoinCapBtc: fetchFromCoinCapBtc,
	fetchFromCoinCap: fetchFromCoinCap,
	fetchFromWorldCoinIndex: fetchFromWorldCoinIndex,
	fetchFromKraken: fetchFromKraken,
	fetchFromPoloniex: fetchFromBittrex,
	fetchFromBitfinex: fetchFromBitfinex,
	fetchFromHitbtc: fetchFromHitbtc,
	fetchFromBithumb: fetchFromBithumb,
	fetchFromLivecoin: fetchFromLivecoin,
	fetchFromExmo: fetchFromExmo,
	fetchFromYobit: fetchFromYobit,
	fetchFromCcex: fetchFromCcex,
	fetchFromBinance: fetchFromBinance,
	fetchFromCoinroom: fetchFromCoinroom,
	fetchFromHuobi: fetchFromHuobi,
	fetchAll: fetchAll
}