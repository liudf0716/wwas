'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const devcieSchema = new Schema({
	gwId: 		String,
	sysUptime:	Number,
	sysMemfree: Number,
	sysLoad: 	Number,
	cpuUsage: 	Number,
	ssid:		String,
	version: 	String,
	type:		String,
	name:		String,
	channelPath:	String,
	wiredPassed:	String,
	wifidogUptime:	String,
	onlineClients:	String,
	offlineClients:	String,
	nfConntrackCount:	String,
	auth: {type: Number, default: 0} // is the device authorized by us
})

deviceSchema.index({gwId: 1});

const Device = mongoose.model('Device', DeviceSchema);


export default Device
