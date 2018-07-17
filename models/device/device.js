'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const deviceSchema = new Schema({
	gwId: 		String,
	sysUptime:	{type: Number, default: 0},
	sysMemfree: {type: Number, default: 0},
	sysLoad: 	{type: Number, default: 0},
	cpuUsage: 	{type: Number, default: 0},
	ssid:		{type: String, default: ''},
	version: 	{type: String, default: ''},
	type:		{type: String, default: 'unknown'},
	name:		{type: String, default: 'unknown'},
	channelPath:	{type: String, default: 'wificoin'},
	wiredPassed:	{type: Number, default: 0},
	wifidogUptime:	{type: Number, default: 0},
	onlineClients:	{type: Number, default: 0},
	offlineClients:	{type: Number, default: 0},
	nfConntrackCount:	{type: Number, default: 0},
	auth: {type: Number, default: 0}, // is the device authorized by us
	ip:	{type: String, defautl: ''} // internet ip
	lastTime: {type: Number, default: 0}
})

deviceSchema.index({gwId: 1});

deviceSchema.statics.findByPage = function (condition, page_size, current_page, sort){
    return new Promise(async (resolve, reject) => {

        console.log("page_size:" + page_size);
        var skipnum = (current_page - 1) * page_size;   //跳过数

        try{
            await this.find(condition).skip(skipnum).limit(page_size).sort(sort).exec(function (err, res) {
                if (err) {
                    //console.log("Error:" + err);
                    resolve(err)
                }
                else{
                    //console.log("query:" + res);
                    resolve(res);
                }
            });
            //console.log('task status 111');
            //resolve('done');
        }catch(err){
            reject({name: 'ERROR_DATA', message: '查找数据失败'});
            console.error(err);
        }
    })
}


const Device = mongoose.model('Device', deviceSchema);


export default Device
