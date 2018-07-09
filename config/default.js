'use strict';

module.exports = {
	port: 8003,
	url: 'mongodb://localhost:27017/wfc',
	insightApi: 'https://insight.wificoin.club/insight-api',
	wfcPayUrl: 'https://wfc.wificoin.club/#/wifiPortal/payment?authServer=',
	wfcAuth: 'http://wifidog.kunteng.org.cn:8001/wifidog/auth/wfc',
	toAddress: 'wbGexNMs1SCut68CNV1HQzUpVYyL4RPjkf',
	toAmount: 2,
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
