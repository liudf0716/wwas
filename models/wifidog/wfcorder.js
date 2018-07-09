'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const wfcOrderSchema = new Schema({
	orderNumber: Number,
	orderTime: Number,
	toAmount: Number,
	gwAddress: String,
	gwPort:	Number,
	gwId: String,
	staMac: String,
})

wfcOrderSchema.index({orderNumber: 1});

const WfcOrder = mongoose.model('WfcOrder', wfcOrderSchema);


export default WfcOrder
