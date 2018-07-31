'use strict';

module.exports = {
	port: 8001,
	mongoUrl: 'mongodb://192.168.1.13:27017/wfc',
	insightApi: 'https://insight.wificoin.club/insight-api',
	wfcPayUrl: 'https://wfc.wificoin.club/#/wifiPortal/payment?authServer=',
	authDomain: 'http://localhost',
	wfcAuthPath: '/wifidog/auth/wfc',
	session: {
		name: 'SID',
		secret: 'SID',
		cookie: {
			httpOnly: true,
			secure: false,
			maxAge: 365 * 24 * 60 * 60 * 1000,
		}
	}
}
