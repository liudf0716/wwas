'use strict'

import ClientModel      from '../../models/client/client'
import GatewayIdModel   from '../../models/setting/gatewayid'
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

			const device = await ClientModel.findOne({gwId:gwId});
			if(!device){
				console.log('impossible: cannot find device: ' + gwId);
				return 0;
			}
            
            var duration = 0;
            var cpSetting;
			var gwSetting = await GatewayIdModel.findOne({gwId: gwId});
			if(!gwSetting){
                cpSetting   = await ChannelPathModel.findOne({channelPath: channelPath});
                if(!cpSetting){
				    console.log('impossible: cannot find setting of ');
				    return 0;
                } else
                    duration = cpSetting.duration;
			} else 
                duration = gwSetting.duration;
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
			var index = 0;
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
			await ClientModel.findOneAndUpdate({gwId}, {$set: device});	
			return 1;
		}catch(err){
			console.log(err);
			return 0;
		}
	}
}

const Client = new client();

export default Client;
