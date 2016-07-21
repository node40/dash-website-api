var express      = require('express');
var app          = express();
var AWS          = require('aws-sdk');
var Exchange     = require('./service/ExchangeService');
var Budget       = require('./service/BudgetService');
var AppConfig    = require('./AppConfig');
var Cache        = require('./service/CacheRepository');
var Masternode   = require('./service/MasternodeService');
var Blockchain   = require('./service/BlockchainService');


app.get('/chain/latestBlocks', function(req,res){

	Blockchain.fetchLatestBlocks(function(err, result){
		if ( err ){
			res.send(err);
		}else{
			res.send(result);
		}
	});
});

app.get('/masternodes/history', function(req,res){

	Masternode.fetchMasternodeHistory(function(err, result){
		if ( err ){
			res.send(err);
		}else{
			res.send(result);
		}
	});
});

app.get('/masternodes/stats', function(req,res){

	Masternode.fetchMasternodeStats(function(err, result){
		if ( err ){
			res.send(err);
		}else{
			res.send(result);
		}
	});
});


app.get('/budgets', function(req,res){
	
	Budget.fetchDashBudgetsData(function(err,result){
		if ( err ){
			res.send(err);
		}else{
			res.send(result);
		}
	});

});

app.get('/exchange', function(req,res){

	Exchange.fetchAll(function(err,result){
		if ( err ){
			res.send(err);
		}else{
			res.send(result);
		}
	});

});

global.cacheConnection = Cache.connect();

var server = app.listen(AppConfig.port, function () {

	var host = server.address().address;
	var port = server.address().port;
	console.log('dash.org api server listening at http://%s:%s', host, port);
});