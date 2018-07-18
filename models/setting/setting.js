'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const settingSchema = new Schema({
	gwId: 			String,
	channelPath: 	String,
	weixin: {
		appId: {type: String, default: 'wxfb684aa755dffceb'},
		shopId: {type: Number, default: '641418'},
		secretKey: {type: String, default: 'ca0ddbac646160edfeaf343937f73404'},
		ssid: {type: String, default: 'ApFreeWiFiDog'}
	},
	wificoin: {
		toAddress: {type: String, default: 'wZirordpuoJgmRp6wRPKZjAjVruQr5gF7r'},
		toAmount: {type: Number, default: 2},
	},
	portalUrl: {type: String, default: 'https://talkblock.org/'},
	duration: {type: Number, default: 3600}
})

settingSchema.index({gwId: 1});

const Setting = mongoose.model('Setting', settingSchema);


export default Setting
