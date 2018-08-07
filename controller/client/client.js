'use strict'

import ClientModel      from '../../models/client/client'
import DeviceModel      from '../../models/device/device'
import ChannelPathModel from '../../models/setting/channelpath'

class client {
    constructor(){
        //console.log('init 111');
    }
    
    async list(req, res, next){
        try{
            var gwId = req.body.gwId;
            const gwClients = await ClientModel.findOne({gwId: gwId});    
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: {gwClients}});
            return;
        }catch(err){
            console.log(err);
        }
        
        res.send({ret_code: 1002, ret_msg: 'FAILED', extra: '用户输入参数无效'});
    }
    
	async updateDeviceClientFromCounter(query) {
		try {
			var mac 	        = query.mac;
			var ip		        = query.ip;
			var token	        = query.token;
			var wired	        = query.wired;
			var name	        = query.name;
			var gwId	        = query.gw_id;
			var incoming	        = query.incoming;
			var outcoming	        = query.outcoming;
			var firstLogin	        = query.first_login;
			var onlineTime	        = query.online_time;
			var lastTime	        = Math.round(+new Date()/1000);
			var incomingdelta	= query.incomingdelta;
			var outcomingdelta	= query.outcomingdelta;
			var channelPath		= query.channel_path;

			var newClient = {
				gwId: gwId,
				clients:[{
					'mac': mac,
					'ip': ip,
					'token': token,
					'wired': wired,
					'name': name,
					'incoming': incoming,
					'outcoming': outcoming,
					'firstLogin': firstLogin,
					'onlineTime': onlineTime,
					'incomingdelta': incomingdelta,
					'outcomingdelta': outcomingdelta,
					'channelPath': channelPath,
					'lastTime': lastTime
				}]
			};
			const device = await ClientModel.findOne({'clients.mac': mac});
			if(!device){
				await ClientModel.create(newClient);
				return 0;
			}
            
			var duration = 0;
			var cpSetting;
			var gwSetting = await DeviceModel.findOne({gwId: gwId});
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
			var index = 0
			for(; index < clients.length; index++){
				if(clients[index].mac == mac){
					clients[index] = item;
					break;
				}
			}
			if(index == clients.length){
				// cannot find the client
				return 0;
			}
			device.clients = clients;
			await ClientModel.findOneAndUpdate({'clients.mac': mac}, {$set: device});	
			return 1;
		}catch(err){
			console.log(err);
			return 0;
		}
	}
}

const Client = new client();

export default Client;
