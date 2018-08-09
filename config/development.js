'use strict';

module.exports = {
	port: 8001,
	mongoUrl: 'mongodb://127.0.0.1:27017/wfc',
	insightApi: 'https://insight.wificoin.club/insight-api',
	wfcPayUrl: 'https://wfc.wificoin.club/#/wifiPortal/payment?authServer=',
	authDomain: 'http://localhost',
	wfcAuthPath: '/wifidog/auth/wfc',
	wxAuthPath: '/wifidog/auth/weixin',
	device_dir: './public/device',
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
