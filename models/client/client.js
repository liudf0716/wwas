'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const clientSchema = new Schema({
	gwId: 		String, // 设备ID
	clients:{
			mac:		String, // 终端mac
			ip:			String, // 终端ip
			token:		String, // 终端授权token
			wired:		Number, // 是否有线设备
			name:		String, // 终端名称
			incoming:	Number, // 下行流量
			outgoing:	Number, // 上行流量
			firstLogin:	Number, // 通过认证时间
			onlineTime:	Number, // 在线时长
			incomingdelta:	Number, 
			outgoingdelta:	Number,
			channelPath:	{type: String, default: 'apfree'}, 
            authType:   {type: Number, default: 1}, // 1: sms auth; 2: user auth
            telNumber:  String, // if sms auth, user's telephone number
			lastTime:	Number, // 最近访问时间
			kickoff:	{type: Boolean, default: false} //
		}
})

clientSchema.index({mac: 1});

const Client = mongoose.model('Client', clientSchema);


export default Client
