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
		var toAmount = config.toAmount + randomValue/1000000;
		var orderTime = Math.round(+new Date()/1000);
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
		var wfcAuthUrl = config.wfcPayUrl + config.wfcAuth + '&orderNumber=' + orderNumber + '&toAddress=' + config.toAddress + '&toAmount=' + toAmount;  
		console.log("wfcAuthUrl is " + wfcAuthUrl);
		res.render('login', { wfcAuth: wfcAuthUrl });
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
					var authTokenUrl = 'http://' + order.gwAddress + ':' + order.gwPort + '/wifidog/auth?token=' + this.generateToken(orderNumber);
					console.log('redirect to : ' + authTokenUrl);
					res.redirect(authTokenUrl);

					var startTime = Math.round(+new Date()/1000);
					console.log('' + token + ':' + startTime + ' ====== ' );
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
				}
			};
			res.send('not pay!');
		});
	}
	async portal(req, res, next){
		res.redirect("https://talkblock.org/");
	}

	generateToken(seed){
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
