'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const deviceSchema = new Schema({
	gwId: 		String, // 设备ID
	sysUptime:	{type: Number, default: 0}, // 系统运行时长
	sysMemfree: {type: Number, default: 0}, // 剩余内存
	sysLoad: 	{type: Number, default: 0}, // 系统负载
	cpuUsage: 	{type: String, default: 0}, // cpu利用率
	ssid:		{type: String, default: ''}, // 无线名称
	version: 	{type: String, default: ''}, // 版本
	type:		{type: String, default: 'unknown'}, // 设备类型
	name:		{type: String, default: 'unknown'}, // 设备名称
	channelPath:	{type: String, default: 'wificoin'}, // 渠道
	wiredPassed:	{type: Number, default: 0}, // 有线免认证
	wifidogUptime:	{type: Number, default: 0}, // wifidog运行时长
	onlineClients:	{type: Number, default: 0}, // 认证终端
	offlineClients:	{type: Number, default: 0}, // 未认证终端
	nfConntrackCount:	{type: Number, default: 0}, // 系统会话数
	lastTime: {type: Number, default: 0}, // 最近上线时间
	deviceStatus: {type: String, default: 0}, // 状态， 0 不在线 1 在线
	remoteAddress:	{type: String, default: ''}, // 设备ip
	auth: {type: Number, default: 0}, // 平台认证， 0 非平台认证设备 1 平台认证设备
})

deviceSchema.index({gwId: 1});

deviceSchema.statics.findByPage = function (condition, page_size, current_page, sort){
    return new Promise(async (resolve, reject) => {
        var skipnum = (current_page - 1) * page_size;   //跳过数

        try{
            await this.find(condition).skip(skipnum).limit(page_size).sort(sort).exec(function (err, res) {
                if (err) {
                    resolve(err)
                }
                else{
                    resolve(res);
                }
            });
        }catch(err){
            reject({name: 'ERROR_DATA', message: '查找数据失败'});
            console.error(err);
        }
    })
}


const Device = mongoose.model('Device', deviceSchema);


export default Device
