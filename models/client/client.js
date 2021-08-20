'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const clientSchema = new Schema({
	gwId: 		String, // 设备ID
	clients:{
			mac:		String, // 终端mac
			ip:			{type: String, default: ''}, // 终端ip
			token:		{type: String, default: ''},// 终端授权token
			wired:		{type: Number, default: 0}, // 是否有线设备
			name:		{type: String, default: ''}, // 终端名称
			incoming:	{type: Number, default: 0}, // 下行流量
			outgoing:	{type: Number, default: 0}, // 上行流量
			firstLogin:	{type: Number, default: 0}, // 通过认证时间
			onlineTime:	{type: Number, default: 0}, // 在线时长
			incomingdelta:	{type: Number, default: 0}, 
			outgoingdelta:	{type: Number, default: 0},
			channelPath:	{type: String, default: 'apfree'}, 
            authType:   {type: Number, default: 1}, // 1: sms auth; 2: user auth
            telNumber:  {type: String, default: ''}, // if sms auth, user's telephone number
			lastTime:	{type: Number, default: 0}, // 最近访问时间
			kickoff:	{type: Boolean, default: false} //
		}
})

clientSchema.index({mac: 1});

const Client = mongoose.model('Client', clientSchema);


export default Client
