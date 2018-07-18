'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const clientSchema = new Schema({
	gwId: 		String,
	clients:[
		{
			mac:		String,
			ip:			String,
			token:		String,
			wired:		Number,
			name:		String,
			incoming:	Number,
			outcoming:	Number,
			firstLogin:	Number,
			onlineTime:	Number,
			incomingdelta:	Number,
			outcomingdelta:	Number,
			channelPath:	String,
			lastTime:		Number
		}
	]
})

clientSchema.index({gwId: 1});

const Client = mongoose.model('Client', clientSchema);


export default Client
