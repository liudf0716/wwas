'use strict'

import ClientModel      from '../../models/client/client'
import DeviceModel      from '../../models/device/device'
import ChannelPathModel from '../../models/setting/channelpath'

const fs = require("fs");
const xlsx = require('node-xlsx');
const moment = require('moment');

class client {
    constructor(){
        //console.log('init 111');
    }
    
    async list(req, res, next){
        try{
            var gwId = req.body.gwId;
            const gwClients = await ClientModel.find({gwId: gwId});    
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: {gwClients}});
            return;
        }catch(err){
            console.log(err);
        }
        
        res.send({ret_code: 1002, ret_msg: 'FAILED', extra: '用户输入参数无效'});
    }
    
    async export(req, res, next) {
        try {
            var user = req.body.user_account;
            var query = await ClientModel.find({ 'channelPath': user }).exec();
            var cltTel = [];
            var telNum;
            
            cltTel.push(['13245678918']); // for testing
            for (var i = 0; i < query.length; i++) {
                telNum = query[i].telNumber;
                if (!telNum.trim())
                    cltTel.push([telNum]);
            }
            
            var datas = xlsx.build([
                { name: user, data: cltTel }
            ]);
            var time = moment().format('YYYYMMDDHHMMSS');
            var file_path = '/client/' + time + '.xlsx';
            var write_path = './public' + file_path;
            fs.writeFileSync(write_path, datas, { 'flag': 'w' });
            res.send({ ret_code: 0, ret_msg: 'SUCCESS', extra: file_path });
            return;
        } catch(err) {
            console.log(err);
        }
        
        res.send({ret_code: 1002, ret_msg: 'FAILED', extra: '用户输入参数无效'});
    }
    
    async kickOffClient(req, res, next) {
        try {
            var filter = req.body.filter;
            await ClientModel.findOneAndUpdate(filter, { $set: {"clients.kickoff": true}} }).exec();
        } catch(e) {
            console.log(e);
        }
    }

    async updateDeviceClientFromCounterV2(body) {
		console.log(body);
        var res_auth = {};
        var gwId = body.gw_id;
        var clients_info = body.clients;
        res_auth['gw_id'] = gwId;
        res_auth['auth_op'] = [];
        
        try{
            for(var i=0; i < clients_info.length; i++){
                var client = clients_info[i];
                var id              = client.id;
                var mac 	        = client.mac;
			    var ip		        = client.ip;
                var token	        = client.token;
                var wired	        = client.wired;
                var name	        = client.name;
                var incoming	    = client.incoming;
                var outgoing	    = client.outgoing;
                var firstLogin	    = client.first_login;
                var onlineTime	    = client.online_time;
				var now             = new Date();
                var nowTime	        = now.getTime();
                var lastTime        = Math.round(+new Date()/1000);
                var auth_code = {};
                auth_code.id = id;
                auth_code.auth_code  = 0;
                
                var newClient = {
                    gwId: gwId,
                    clients:{
                        'mac': mac,
                        'ip': ip,
                        'token': token,
                        'wired': wired,
                        'name': name,
                        'incoming': incoming,
                        'outgoing': outgoing,
                        'firstLogin': firstLogin,
                        'onlineTime': onlineTime,
                        'lastTime': nowTime
                    }
                };
                
                var kickoff = false;
                const device = await ClientModel.findOne({'gwId': gwId,'clients.mac': mac});
                if(!device){
                    await ClientModel.create(newClient);
                    auth_code.auth_code = 1;
                	res_auth['auth_op'].push(auth_code);
					continue;
                } else {
                    device.clients.ip = ip;
                    device.clients.token = token;
                    device.clients.incoming = incoming;
                    device.clients.outgoing = outgoing;
                    device.clients.onlineTime = onlineTime;
                    device.clients.lastTime = nowTime;
                    if (device.clients.kickoff) {
                        kickoff = true;
                        device.clients.kickoff = false;
                    } 
                    await device.save();
                }

                var duration = 0;
                var cpSetting;
                var gwSetting = await DeviceModel.findOne({'gwId': gwId});
                if(!gwSetting){
                    console.log('impossible: cannot find setting of gateway');
                	res_auth['auth_op'].push(auth_code);
					continue;
                }else{ 
                    cpSetting = await ChannelPathModel.findOne({channelPath: gwSetting.channelPath});
                    if(!cpSetting){
                        console.log('impossible: cannot find setting of channelPath');
                		res_auth['auth_op'].push(auth_code);
                        continue;
                    }else{
                        duration = cpSetting.duration;
                    }
                }

                if(duration < (lastTime - firstLogin)){
                    console.log('client timeout ' + mac);
                	res_auth['auth_op'].push(auth_code);
                    continue;
                } 

                // await ClientModel.findOneAndUpdate({'gwId': gwId,'clients.mac': mac}, {$set: newClient});
                
                if (kickoff) {
                    console.log('kickoff client' + mac);
                } else 
                    auth_code.auth_code = 1;
                res_auth['auth_op'].push(auth_code);
            }
        }catch(err){
            console.log(err);
        }
        
        return res_auth;
    }
    
	async updateDeviceClientFromCounter(query) {
		try {
			var mac 	        = query.mac;
			var ip		        = query.ip;
			var token	        = query.token;
			var wired	        = query.wired;
			var name	        = query.name;
			var gwId	        = query.gw_id;
			var incoming	    = query.incoming;
			var outgoing	    = query.outgoing;
			var firstLogin	    = query.first_login;
			var onlineTime	    = query.online_time;
			var now             = new Date();
            var nowTime	        = now.getTime();
			var lastTime        = Math.round(+new Date()/1000);

			var newClient = {
				gwId: gwId,
				clients:{
					'mac': mac,
					'ip': ip,
					'token': token,
					'wired': wired,
					'name': name,
					'incoming': incoming,
					'outgoing': outgoing,
					'firstLogin': fristLogin,
					'onlineTime': onlineTime,
					'lastTime': nowTime
				}
			};
			let device = await ClientModel.findOne({'gwId': gwId,'clients.mac': mac});
			if(!device){
				await ClientModel.create(newClient);
				return 1;
			} else {
                var kickoff = false;
                device.clients.ip = ip;
                device.clients.token = token;
                device.clients.incoming = incoming;
                device.clients.outgoing = outgoing;
                device.clients.onlineTime = onlineTime;
                device.clients.lastTime = nowTime;
                if (device.clients.kickoff) {
                    kickoff = true;
                    device.clients.kickoff = false;
                } 
                await device.save();
                if (kickoff) {
                    console.log('kickoff client ' + mac);
                    return 0;
                }
            }
            
			var duration = 0;
			var cpSetting;
			var gwSetting = await DeviceModel.findOne({'gwId': gwId});
			if(!gwSetting){
				console.log('impossible: cannot find setting of gateway');
				return 0;
			}else{ 
				cpSetting = await ChannelPathModel.findOne({channelPath: gwSetting.channelPath});
				if(!cpSetting){
					console.log('impossible: cannot find setting of channelPath');
					return 0;
				}else{
					duration = cpSetting.duration;
				}
			}

			if(duration < (lastTime - firstLogin)){
				console.log('client timeout ' + mac);
				return 0;
			}

			// await ClientModel.findOneAndUpdate({'gwId': gwId,'clients.mac': mac}, {$set: newClient});
			return 1;
		}catch(err){
			console.log(err);
			return 0;
		}
	}
}

const Client = new client();

export default Client;
