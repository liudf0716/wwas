'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const deviceSchema = new Schema({
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
