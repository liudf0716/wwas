'use strict';

import OrderModel from '../../models/wifidog/wfcorder'
import TokenModel from '../../models/wifidog/token'
import WiFicoinModel	from '../../models/config/wificoin'
import path from 'path';
import fs 	from 'fs';
import UniqueNumber from 'unique-number';
import config 	from 'config-lite';
import requestify	from 'requestify';
import crypto	from 'crypto';

class Wifidog {
	constructor() {
		this.generateMD5 		= this.generateMD5.bind(this);
		this.generateWfcAuthUrl = this.generateWfcAuthUrl.bind(this);
		this.generateWxAuthUrl	= this.generateWxAuthUrl.bind(this);
		this.generateTxidRequest	= this.generateTxidRequest.bind(this);
		this.generateAuthTokenUrl	= this.generateAuthTokenUrl.bind(this);
		this.login 		= this.login.bind(this);
		this.authWfc	= this.authWfc.bind(this);
		this.authWeixin	= this.authWeixin.bind(this);
	}

	async ping(req, res, next){
		res.send('Pong');
	}

	async login(req, res, next){
		var gwAddress = req.query.gw_address;
		var gwPort	= req.query.gw_port;
		var gwId	= req.query.gw_id;
		var	staMac	= req.query.mac;
		var ssid	= req.query.ssid;
		var channel	= req.query.channel_path;
		var origUrl	= req.query.url
		var orderNumber = new UniqueNumber(true).generate();
		var	randomValue = Math.floor(Math.random() * (9999 - 1000 - 1)) + 1000;
		var toAmount 	= config.toAmount + randomValue/1000000;
		var orderTime 	= Math.round(+new Date()/1000);
		console.log('orderTime is ' + orderTime)
		const newOrder = {
			orderNumber,
			orderTime,
			toAmount,
			gwAddress,
			gwPort,
			gwId,
			staMac
		};
		const order = await OrderModel.findOne({orderNumber});
		if (!order){
			await OrderModel.create(newOrder);
		}else{
			await OrderModel.findOneAndUpdate({orderNumber}, {$set: newOrder});	
		}
		var wfcAuthUrl 	= this.generateWfcAuthUrl(orderNumber, toAmount);
		var wxAuthUrl 	= this.generateWxAuthUrl();
		var timestamp 	= Math.round(+new Date());
		var tmp 	= config.wxAppId + orderNumber + timestamp + config.wxShopId + wxAuthUrl + staMac + ssid + staMac +  config.wxSecretKey;
		var wxSign 	= this.generateMD5(tmp);
		console.log("wfcAuthUrl is " + wfcAuthUrl + "\n wxAuthUrl is " + wxAuthUrl);
		res.render('login', {
			 wfcAuth: wfcAuthUrl,
			 gwAddress: gwAddress,
			 gwPort: gwPort,
			 appId: config.wxAppId,
			 extend: orderNumber,
			 timestamp: timestamp,
			 sign: wxSign,
			 shopId: config.wxShopId,
			 authUrl: wxAuthUrl,
			 mac: staMac,
			 ssid: ssid,
			 bssid: staMac});
	}
	async auth(req, res, next){
		var stage = req.query.stage;

		console.log('auth stage is ' + stage);
		if (stage == 'login') {
			console.log('query is ' + JSON.stringify(req.query));
			var token 	= req.query.token;
			var staMac	= req.query.mac;
			const tokenObj = await TokenModel.findOne({token});
			if (!tokenObj) {
				console.log('no tokenObj');
				res.send('Auth: 0');
			} else {
				res.send('Auth: 1');
			}
		} else if (stage == 'counters') {
			res.send("Auth: 1");
		} else {
			res.send("unkown stage");
		}
	}
	async authWeixin(req, res, next){
		console.log('authWeixin query is ' + JSON.stringify(req.query));
		var extend 	= req.query.extend;
		var openId	= req.query.openId;
		var tid		= req.query.tid;
		var sign	= req.query.sign;
		var timestamp	= req.query.timestamp;
		const order = await OrderModel.findOne({ orderNumber: extend });
		if (!order) { 
			res.send('no such wfc order');
			return;
		}

		var gwPort		= order.gwPort;
		var gwAddress	= order.gwAddress;
		var	gwId		= order.gwId;
		var staMac		= order.staMac;
		var token 		= this.generateMD5(extend);
		var authTokenUrl= this.generateAuthTokenUrl(order.gwAddress, order.gwPort, token, 'weixin');
		res.redirect(authTokenUrl);

		var startTime = Math.round(+new Date()/1000);
		const newToken = {
			token,
			startTime,
			gwAddress,
			gwPort,
			gwId,
			tid
		};

		TokenModel.create(newToken);
	}
	async authWfc(req, res, next){
		console.log("orderNumber is " + req.query.orderNumber);
		var orderNumber = req.query.orderNumber;
		var txid = req.query.txid;
		const order = await OrderModel.findOne({orderNumber});
		if (!order) { 
			res.send('no such wfc order');
		}

		var gwPort	= order.gwPort;
		var gwAddress = order.gwAddress;
		var	gwId	= order.gwId;
		var staMac	= order.staMac;
		var token = this.generateMD5(orderNumber);
		var authTokenUrl = this.generateAuthTokenUrl(order.gwAddress, order.gwPort, token);
		console.log('order info : ' + gwAddress + ':' + gwPort + ':' + gwId + ':' + staMac);
		requestify.get(this.generateTxidRequest(txid))
			.then (function(response){
			var tx = response.getBody();
			var item;
			for (item in tx.vout){
				var vout = tx.vout[item];
				var value 	= vout.value;
				var addresses = vout.addresses;
				console.log('value: ' + value);
				if (order.toAmount == value) {
					try {
					res.redirect(authTokenUrl);

					var startTime = Math.round(+new Date()/1000);
					const newToken = {
						token,
						startTime,
						gwAddress,
						gwPort,
						gwId,
						staMac
					};

					TokenModel.create(newToken);
					return;
					} catch(err) {
						console.log(err.message, err);
						res.send('pay error');
					}
				}
			};
			res.send('pay error!');
		});
	}
	async portal(req, res, next){
		console.log('portal here ' + JSON.stringify(req.query));
		res.redirect("https://talkblock.org/");
	}
	
	generateAuthTokenUrl(gwAddress, gwPort, token, type = '') {
		try {
			var authTokenUrl = 'http://' + gwAddress + ':' + gwPort + '/wifidog/auth?token=' + token;
			if (type != '')
				authTokenUrl += '&type=' + type;
			console.log('authTokenUrl is ' + authTokenUrl);
			return authTokenUrl;
		} catch (err) {
			console.log(err.message, err);
		}
	}

	generateWxAuthUrl(){
		var wxAuthUrl = config.authUrl + ':' + config.port + config.wxAuth;
		return wxAuthUrl;
	}
	
	generateWfcAuthUrl(orderNumber, toAmount){
		try {
			var wfcAuthUrl = config.wfcPayUrl + config.authUrl + ':' + config.port + config.wfcAuth;
				wfcAuthUrl += '&orderNumber=' + orderNumber + '&toAddress=' + config.toAddress + '&toAmount=' + toAmount;  
		
			return wfcAuthUrl;
		} catch (err) {
			console.log(err.message, err);
		}
	}
	
	generateMD5(seed){
		var md5 = crypto.createHash('md5');
		var token = md5.update(seed).digest('hex');
		return token;
	}

	generateTxidRequest(txid){
		var txidRequest = config.insightApi + '/tx/' + txid;
		console.log('txidRequest is ' + txidRequest);
		return txidRequest;
	}
}

export default new Wifidog() 
