'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const wificoinSchema = new Schema({
	gwId: 		String,
	channelPath:String,
	toAddress: {type: String, default: 'wZirordpuoJgmRp6wRPKZjAjVruQr5gF7r'},
	toAmount: {type: Number, default: 2},
	portalUrl: {type: String, default: 'https://talkblock.org/'},
	duration: {type: Number, default: 1} // default 1 hour
})

wificoinSchema.index({gwId: 1});

const WiFicoin = mongoose.model('WiFicoin', wificoinSchema);


export default WiFicoin
