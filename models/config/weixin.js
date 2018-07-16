'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const weixinSchema = new Schema({
	gwAddress: String,
	channel: String,
	appId: {type: String, default: 'wxfb684aa755dffceb'},
	shopId: {type: Number, default: '641418'},
	secretKey: {type: String, default: 'ca0ddbac646160edfeaf343937f73404'},
	ssid: {type: String, default: 'ApFreeWiFiDog'},
})

weixinSchema.index({gwAddress: 1});

const Weixincoin = mongoose.model('Weixincoin', weixinSchema);


export default Weixin
