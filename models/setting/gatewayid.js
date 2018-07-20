'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const gatewayIdSchema = new Schema({
	gwId: 			String,
    channelPath:{type: String, default: 'wificoin'}
})

gatewayIdSchema.index({gwId: 1});

const GatewayId = mongoose.model('GatewayId', gatewayIdSchema);


export default GatewayId
