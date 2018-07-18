'use strict';

import OrderModel from '../../models/wifidog/wfcorder'
import TokenModel from '../../models/wifidog/token'
import DeviceModel	from '../../models/device/device'
import SettingModel	from '../../models/setting/setting'
import ClientModel 	from '../../models/client/client'
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
		this.updateDeviceClientFromQuery	= this.updateDeviceClientFromQuery.bind(this);
		this.login 		= this.login.bind(this);
		this.ping		= this.ping.bind(this);
		this.authWfc	= this.authWfc.bind(this);
		this.authWeixin	= this.authWeixin.bind(this);
	}

	async ping(req, res, next){
		try {
		var gwId		= req.query.gw_id;
		var	sysUptime	= req.query.sys_uptime;
		var sysMemfree	= req.query.sys_memfree;
		var sysLoad		= req.query.sys_load;
		var	cpuUsage	= req.query.cpu_usage; 
		var	ssid		= req.query.ssid;
		var	version		= req.query.version;
		var	type		= req.query.type; 	// router type
		var	name		= req.query.name;	// router name
		var	channelPath			= req.query.channel_path;
		var	wiredPassed			= req.query.wired_passed;
		var	wifidogUptime		= req.query.wifidog_uptime;
		var	onlineClients		= req.query.online_clients;
		var	offlineClients		= req.query.offline_clients;
		var	nfConntrackCount	= req.query.nf_conntrack_count;
		var lastTime			= Math.round(+new Date()/1000);
		var	remoteAddress		= req.connection.remoteAddress;
		var deviceStatus		= 1;
		const newDevice = {
			gwId,
			sysUptime,
			sysMemfree,
			sysLoad,
			cpuUsage,
			ssid,
			version,
			type,
			name,
			channelPath,
			wiredPassed,
			wifidogUptime,
			onlineClients,
			offlineClients,
			nfConntrackCount,
			lastTime,
			remoteAddress,
			deviceStatus
		}

		const device = await DeviceModel.findOne({gwId: gwId});
		if(!device){
			await DeviceModel.create(newDevice);
		} else {
			await DeviceModel.findOneAndUpdate({gwId}, {$set: newDevice});
		}
		}catch(e){
			console.log(e);
		}
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
		const deviceSetting 	= this.getDeviceSetting(gwId);
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
			 appId: deviceSetting.wxAppId,
			 extend: orderNumber,
			 timestamp: timestamp,
			 sign: wxSign,
			 shopId: deviceSetting.wxShopId,
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
			var result = this.updateDeviceClientFromQuery(req.query);
			res.send('Auth: ' + result);
		} else if (stage == 'logout') {
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
		const setting = await SettingModel.findOne({'gwId':gwId});
		if(setting)
			res.redirect(setting.portalUrl);
		else
			res.redirect("https://talkblock.org/");
	}
	
	async getDeviceSetting(gwId) {
		try{
			const deviceSetting = await SettingModel.findOne({'gwId':gwId});
			if(deviceSetting)
				return deviceSetting;
			
			const newSetting = {'gwId': gwId };	
			await SettingModel.create(newSetting);
		}catch(err){
			console.log(err);
		}
	}
	
	async updateDeviceClientFromQuery(query) {
		try {
			var mac 	= query.mac;
			var ip		= query.ip;
			var token	= query.token;
			var wired	= query.wired;
			var	name	= query.name;
			var	gwId	= query.gw_id;
			var incoming	= query.incoming;
			var outcoming	= query.outcoming;
			var firstLogin	= query.first_login;
			var onlineTime	= queyr.online_time;
			var lastTime	= Math.round(+new Date()/1000);
			var incomingdelta	= query.incomingdelta;
			var outcomingdelta	= query.outcomingdelta;
			var	channelPath		= query.channel_path;

			const device = await ClientModel.findOne({'gwId':gwId});
			if(!device){
				console.log('impossible: cannot find device: ' + gwId);
				return 0;
			}
			const setting = await SettingModel.findOne({'gwId':gwId});
			if(!setting){
				console.log('impossible: cannot find setting of ' + gwId);
				return 0;
			}
			if(setting.duration < (lastTime - firstLogin)){
				console.log('client timeout ' + mac);
				return 0;
			}

			var clients = device.clients;
			const item = {	
				mac: 	mac,
				ip:		ip,
				token:	token,
				wired:	wired,
				name:	name,
				incoming:	incoming,
				outcoming:	outcoming,
				firstLogin:	firstLogin,
				onlineTime:	onlineTime,
				lastTime:	lastTime,	
				incomingdelta:	incomingdelta,
				outcomingdelta:	outcomingdelta,
				channelPath:	channelPath,
			};
			var index = 0;
			for(; index < clients.length; index++){
				if(clients[index].mac == mac){
					clients[index] = item;
					break;
				}
			}
			if(index == clients.length)
				clients.append(item);
			device.clients = clients;
			await ClientModel.findOneAndUpdate({gwId}, {$set: device});	
			return 1;
		}catch(err){
			console.log(err);
			return 0;
		}

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
