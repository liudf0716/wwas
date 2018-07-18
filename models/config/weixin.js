'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const weixinSchema = new Schema({
	gwId: 			String,
	channelPath: 	String,
	appId: {type: String, default: 'wxfb684aa755dffceb'},
	shopId: {type: Number, default: '641418'},
	secretKey: {type: String, default: 'ca0ddbac646160edfeaf343937f73404'},
	ssid: {type: String, default: 'ApFreeWiFiDog'},
	duration: {type: Number, default: 1}
})

weixinSchema.index({gwId: 1});

const Weixin = mongoose.model('Weixin', weixinSchema);


export default Weixin
