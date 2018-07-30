'use strict';

module.exports = {
	port: 8001,
	url: 'mongodb://localhost:27017/wfc',
	insightApi: 'https://insight.wificoin.club/insight-api',
	authUrl: 'http://wifidog.kunteng.org.cn',
	wfcPayUrl: 'https://wfc.wificoin.club/#/wifiPortal/payment?authServer=',
	wfcAuth: '/wifidog/auth/wfc',
	session: {
		name: 'SID',
		secret: 'SID',
		cookie: {
			httpOnly: true,
		    secure:   false,
		    maxAge:   365 * 24 * 60 * 60 * 1000,
		}
	}
}
