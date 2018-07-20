'use strict';

import OrderModel from '../../models/wifidog/wfcorder'
import TokenModel from '../../models/wifidog/token'
import DeviceModel	from '../../models/device/device'
import GatewayIdModel	from '../../models/setting/gatewayid'
import ChannelPathModel	from '../../models/setting/channelpath'
import ClientModel 	from '../../models/client/client'
import device	from '../device/device'
import client	from '../client/client'
import path from 'path';
import fs 	from 'fs';
import config 	from 'config-lite';
import crypto	from 'crypto';
import requestify	from 'requestify';
import UniqueNumber from 'unique-number';

class Wifidog {
	constructor() {
		this.generateMD5 		= this.generateMD5.bind(this);
		this.generateWfcAuthUrl = this.generateWfcAuthUrl.bind(this);
		this.generateWxAuthUrl	= this.generateWxAuthUrl.bind(this);
		this.generateTxidRequest	= this.generateTxidRequest.bind(this);
		this.generateAuthTokenUrl	= this.generateAuthTokenUrl.bind(this);
		this.getDeviceSetting		= this.getDeviceSetting.bind(this);
		this.login 		= this.login.bind(this);
		this.ping		= this.ping.bind(this);
		this.authWfc	= this.authWfc.bind(this);
		this.authWeixin	= this.authWeixin.bind(this);
	}

	async ping(req, res, next){
		client.updateDeviceFromPing(req);
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
		var orderTime 	= Math.round(+new Date()/1000);
		const deviceSetting 	= device.deviceSetting(gwId);
        if(deviceSetting == null)
            deviceSetting = device.deviceSetting(gwId);
		var toAmount	= deviceSetting.wificoin.toAmount + randomValue/1000000;
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
		var wfcAuthUrl 	= this.generateWfcAuthUrl(orderNumber, deviceSetting.wificoin.toAddress, toAmount);
		var wxAuthUrl 	= this.generateWxAuthUrl();
		var timestamp 	= Math.round(+new Date());
		var tmp 	= deviceSetting.weixin.wxAppId + orderNumber + timestamp + 
					  deviceSetting.weixin.wxShopId + wxAuthUrl + staMac + ssid + staMac +  deviceSetting.weixin.wxSecretKey;
		var wxSign 	= this.generateMD5(tmp);
		res.render('login', {
			 wfcAuth: wfcAuthUrl,
			 gwAddress: gwAddress,
			 gwPort: gwPort,
			 appId: deviceSetting.weixin.wxAppId,
			 extend: orderNumber,
			 timestamp: timestamp,
			 sign: wxSign,
			 shopId: deviceSetting.weixin.wxShopId,
			 authUrl: wxAuthUrl,
			 mac: staMac,
			 ssid: ssid,
			 bssid: staMac});
	}

	async auth(req, res, next){
		var stage = req.query.stage;

		console.log('auth stage is ' + stage);
		if (stage == 'login') {
			var token 	= req.query.token;
			const tokenObj = await TokenModel.findOne({token});
			if (!tokenObj) { res.send('Auth: 0'); } else {
				res.send('Auth: 1');
			}
		} else if (stage == 'counters') {
			var result = client.updateDeviceClientFromCounter(req.query);
			res.send('Auth: ' + result);
		} else if (stage == 'logout') {
		} else {
			res.send("illegal stage");
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
		var authTokenUrl= this.generateAuthTokenUrl(order.gwAddress, order.gwPort, token);
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
		var gwId 		= req.query.gw_id;
		var channelPath	= req.query.channel_path;
		const setting = await device.deviceSetting(gwId);
		if(setting != null)
			res.redirect(setting.portalUrl);
		else
			res.redirect("https://talkblock.org/");
	}

	generateAuthTokenUrl(gwAddress, gwPort, token, type = '') {
		var authTokenUrl = 'http://' + gwAddress + ':' + gwPort + '/wifidog/auth?token=' + token;
		if (type != '')
			authTokenUrl += '&type=' + type;
		return authTokenUrl;
	}

	generateWxAuthUrl(){
		var wxAuthUrl = config.authUrl + ':' + config.port + config.wxAuth;
		return wxAuthUrl;
	}
	
	generateWfcAuthUrl(orderNumber, toAddress, toAmount){
		var wfcAuthUrl = config.wfcPayUrl + config.authUrl + ':' + config.port + config.wfcAuth;
			wfcAuthUrl += '&orderNumber=' + orderNumber + '&toAddress=' + toAddress + '&toAmount=' + toAmount;  
		
		return wfcAuthUrl;
	}
	
	generateMD5(seed){
		var md5 = crypto.createHash('md5');
		var token = md5.update(seed).digest('hex');
		return token;
	}

	generateTxidRequest(txid){
		var txidRequest = config.insightApi + '/tx/' + txid;
		return txidRequest;
	}
}

export default new Wifidog() 
