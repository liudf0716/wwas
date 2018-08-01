'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const channelPathSchema = new Schema({
	channelPath: 	String,
	weixin: {
		appId: {type: String, default: 'wxfb684aa755dffceb'},
		shopId: {type: Number, default: '641418'},
		secretKey: {type: String, default: 'ca0ddbac646160edfeaf343937f73404'},
		ssid: {type: String, default: 'ApFreeWiFiDog'}
	},
	wificoin: {
		toAddress: {type: String, default: 'wZirordpuoJgmRp6wRPKZjAjVruQr5gF7r'},
		toAmount: {type: Number, default: 2000000},
	},
	portalUrl: {type: String, default: 'https://talkblock.org/'},
	duration: {type: Number, default: 3600}
})

channelPathSchema.index({channelPath: 1});

const ChannelPath = mongoose.model('ChannelPath', channelPathSchema);


export default ChannelPath
