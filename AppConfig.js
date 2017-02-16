var path = require('path');
var rootPath = path.normalize(__dirname + '/..');
var env = process.env.NODE_ENV || 'development';

var config = {
	development: {
		exchanges: {
			coincap: {
				name: 'CoinCap',
				orgUrl: 'http://coincap.io/',
				url: 'https://api.coinmarketcap.com/v1/ticker/dash'
			},
			worldcoin: {
				name: 'WorldCoinIndex',
				orgUrl: 'https://www.worldcoinindex.com',
				url: 'https://www.worldcoinindex.com/apiservice/json',
				apiKey: 'ePSl8tl8dsFhLyReZ6aIwCQNw'
			}
		},
		budgets: {
			dashwhale: {
				name: 'DashWhale',
				url: 'https://www.dashwhale.org/api/v1/budget'
			}
		},
		masternodes: {
			node40: {
				name: 'Node40',
				apiKey: '8e4ec80a6394db3411b8af9afa3b5156d36fd18102f1278fef59a3e40d9bf6af',
				apiKeyHeader: 'X-Api-Key',
				historyUrl: 'https://node40.com/monitor/api/masterNode/history',
				statsUrl: 'https://node40.com/monitor/api/masterNode/stats'
			}
		},
		chain: {
			insight: {
				name: 'Insight',
				url: 'https://insight.dash.siampm.com/api/blocks',
				maxBlocks: 10
			}
		},
		root: rootPath,
		app: {
			name: 'dash.org-api'
		},
		email: {
			contactEmailAddress: "contact@dash.org",
			transportConfig : {
				port: 2525,
				host: "localhost",
				secure: false,
				auth: {
					user: "localWebUser",
					pass: "asdfg"
				}
			}
		},
		port: process.env.PORT || 8080,
		logLevel: 'DEBUG' // EMERGENCY|ALERT|CRITICAL|ERROR|WARNING|NOTICE|INFO|DEBUG
	},

	test: {
		root: rootPath,
		app: {
			name: 'dash.org-api'
		},
		port: process.env.PORT || 9090
	},

	production: {
		root: rootPath,
		app: {
			name: 'dash.org-api'
		},
		port: process.env.PORT || 9090,
		email: {
			contactEmailAddress: "contact@dash.org",
			transportConfig : {
				service: "Gmail",
				auth: {
					user: "",
					pass: ""
				}
			}
		},
	}
};

module.exports = config[env];
