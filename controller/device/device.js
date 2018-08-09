'use strict';

import DeviceModel from '../../models/device/device'
import GatewayIdModel from '../../models/setting/gatewayid'
import ChannelPathModel from '../../models/setting/channelpath'
import dtime from 'time-formater';
import config from "config-lite";
import devClient from '../client/client'
const formidable = require('formidable');
const fs = require("fs");
const xlsx = require('node-xlsx');
const moment = require('moment');
const schedule = require('node-schedule');

//引入事件模块
const events = require("events");

class deviceHandle {
    constructor() {
        //console.log('init 111');
    }

    async import(req, res, next) {
        console.log('device import');

        //获取表单数据，josn
        var route_macs = req.body['route_mac'];
        var user_name = req.body['user_name'];  //当前渠道名称

        // 参数有效性检查
        if (typeof (route_macs) === "undefined") {
            res.send({ ret_code: 1002, ret_msg: 'FAILED', extra: '用户输入参数无效' });
            return;
        }

        //去掉空格， 分割成数组形式
        //"60ACC800ADA2,      60ACC800ADA3, 60ACC800ADA4" ----------》[ '60ACC800ADA2', '60ACC800ADA3', '60ACC800ADA4' ]
        var mac_array = route_macs.replace(/[ ]/g, "").replace(/(\r\n)|(\n)/g, ",").split(/[;,]/);
        //去掉最后的空数组元素，如果输入60ACC800ADA2，分割是最后一个元素是''
        if (mac_array[mac_array.length - 1] == '') {
            mac_array.pop();
        }

        try {
            //修改渠道
            var ill_mac = [];
            for (var i = 0; i < mac_array.length; i++) {
                //去掉空格  //mac 地址合法性检查
                var mac = mac_array[i].trim().toUpperCase();
                if (mac.length != 12 || mac.search(/[^0-9A-F]/gi) >= 0) {
                    //不合法， 不导入
                    console.log('illegal mac ' + mac);
                    continue;
                }

                // 更新DeviceTable, 如果升级ok的话就不更新
                var wherestr = { 'gwId': mac };

                //如果采用返回值得形式，必须的await
                var query = await DeviceModel.findOne(wherestr).exec();
                if (query != null) {
                    if (query.channelPath === '' || query.channelPath === 'wificoin') {
                        var updatestr = { 'channelPath': user_name };
                        await DeviceModel.findByIdAndUpdate(query['_id'], updatestr).exec();
                    } else {
                        ill_mac.push(mac_array[i]);
                    }
                } else {
                    //如果没有，就直接添加一个新的mac
		    var mytime = new Date();
                    var updatestr = {
                        'gwId': mac,
                        'channelPath': user_name,
			'auth': 1,
			'lastTime': mytime.getTime()
                    };
                    await DeviceModel.create(updatestr);
                }
            }

            //导入完成
            if (ill_mac.length !== 0) {
                res.send({ ret_code: 1017, ret_msg: 'HAVE_ILLEGAL_MAC', extra: ill_mac });
            } else {
                res.send({ ret_code: 0, ret_msg: 'SUCCESS', extra: [] });
            }

        } catch (err) {
            res.send({ ret_code: -1, ret_msg: 'FAILED', extra: err });
        }
    }

    async import_excel(req, res, next) {
        var user_name = '';
        var fileName = '';
        var uploadedPath = '';
        var fileTypeError = false;
        var form = new formidable.IncomingForm({
            encoding: 'utf-8',
            keepExtensions: true,
            maxFieldsSize: 10 * 1024 * 1024,
            uploadDir: config.firmware_dir
        });



        form.on('field', function (field, value) {
            if (field == 'user_name') {
                user_name = value;
            }
        });

        form.on('file', function (field, file) {
            fileName = file.name;
            uploadedPath = file.path

            //判断文件类型是否是xlsx
            if (file.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                fileTypeError = true;
            }
        });

        form.on('end', async function () {
            //遍历上传文件
            //读取文件内容
            var obj = xlsx.parse(uploadedPath);
            var excelObj = obj[0].data;

            var mac_array = [];
            for (var i in excelObj) {
                var value = excelObj[i];
                for (var j in value) {
                    mac_array.push(value[j]);
                }
            }

            console.log(mac_array);
            try {
                //修改渠道
                var ill_mac = [];
                for (var i = 0; i < mac_array.length; i++) {
                    //去掉空格  //mac 地址合法性检查
                    var mac = mac_array[i].trim().toUpperCase();
                    if (mac.length != 12 || mac.search(/[^0-9A-F]/gi) >= 0) {
                        //不合法， 不导入
                        continue;
                    }

                    // 更新DeviceTable, 如果升级ok的话就不更新
                    var wherestr = { 'gwId': mac };

                    //如果采用返回值得形式，必须的await
                    var query = await DeviceModel.findOne(wherestr).exec();
                    if (query != null) {
                        if (query.user_name === '') {
                            var updatestr = { 'channelPath': user_name };
                            await DeviceModel.findByIdAndUpdate(query['_id'], updatestr).exec();
                        } else {
                            ill_mac.push(mac_array[i]);
                        }
                    }
                    else {
                        //如果没有，就直接添加一个新的mac
			var mytime = new Date();
                        var updatestr = {
                            'gwId': mac,
                            'channelPath': user_name,
			    'auth': 1,
			    'lastTime': mytime.getTime()
                        };

                        await DeviceModel.create(updatestr);
                    }
                }

                if (ill_mac.length !== 0) {
                    res.send({ ret_code: 1017, ret_msg: 'HAVE_ILLEGAL_MAC', extra: ill_mac });
                } else {
                    //导入完成
                    res.send({ ret_code: 0, ret_msg: 'SUCCESS', extra: uploadedPath });
                }

            } catch (err) {
                res.send({ ret_code: -1, ret_msg: 'FAILED', extra: err });
            }

            //删除文件
            fs.unlinkSync(uploadedPath);
        });

        form.on('error', function (err) {
            res.send({ ret_code: -1, ret_msg: 'FAILED', extra: "上传出错" });
        });


        form.on('aborted', function () {
            res.send({ ret_code: -1, ret_msg: 'FAILED', extra: "放弃上传" });
        });

        form.parse(req);
    }

    async leave(req, res, next) {
        //获取表单数据，josn
        var route_mac = req.body['route_mac'];

        // 参数有效性检查
        if (typeof (route_mac) === "undefined") {
            res.send({ ret_code: 1002, ret_msg: 'FAILED', extra: '用户输入参数无效' });
            return;
        }

        try {
            // 更新DeviceTable, 如果升级ok的话就不更新
            var wherestr = { 'gwId': route_mac };
            var updatestr = { 'channelPath': 'wificoin' };
            var query = await DeviceModel.findOneAndUpdate(wherestr, updatestr).exec();

            //退出完成
            res.send({ ret_code: 0, ret_msg: 'SUCCESS', extra: query });

        } catch (err) {
            res.send({ ret_code: -1, ret_msg: 'FAILED', extra: err });
        }
    }


    async export(req, res, next) {
        var user = req.body.user_account;
        var query = await DeviceModel.find({ 'channelPath': user }).exec();
        var macs = [];
        for (var i = 0; i < query.length; i++) {
            macs.push([query[i].gwId]);
        }
        var datas = xlsx.build([
            { name: user, data: macs }
        ]);
        var time = moment().format('YYYYMMDDHHMMSS');
        var file_path = '/device/' + time + '.xlsx';
        var write_path = './public' + file_path;
        fs.writeFileSync(write_path, datas, { 'flag': 'w' });
        res.send({ ret_code: 0, ret_msg: 'SUCCESS', extra: file_path });
    }

    ///权限控制
    async permission(req, res, next) {
        //本地调试
        if (process.env.NODE_ENV == 'local') {
            next();
            return;
        }

        //超级管理员
        if (req.session.user_type == 0) {
            next();
            return;
        }


        try {
            var filter = req.body['filter'];

            // 如果没有定义排序规则，添加默认排序
            if (typeof (filter) === "undefined") {
                res.send({ ret_code: 1014, ret_msg: 'FAILED', extra: '需要指定渠道' });
                return;
            }

            if (filter['channelPath'] == req.session.user_account) {
                next();
                return;
            } else {
                res.send({ ret_code: 1015, ret_msg: 'FAILED', extra: '用户名和对应渠道不一致' });
                return;
            }

        } catch (err) {
            res.send({ ret_code: 1009, ret_msg: 'FAILED', extra: '路径访问权限不够' });
        }

    }


    async list(req, res, next) {
        //获取表单数据，josn
        var page_size = req.body['page_size'];
        var current_page = req.body['current_page'];
        var sort = req.body['sort'];
        var filter = req.body['filter'];

        // 如果没有定义排序规则，添加默认排序
        if (typeof (sort) === "undefined") {
            console.log('sort undefined');
            sort = { "lastTime": -1 };
        }


        // 如果没有定义排序规则，添加默认排序
        if (typeof (filter) === "undefined") {
            console.log('filter undefined');
            filter = {};
        }

        //参数有效性检查
        if (typeof (page_size) === "undefined" && typeof (current_page) === "undefined") {
            var count = await DeviceModel.count(filter);
            var query = await DeviceModel.find(filter).sort(sort).limit(10);
            res.send({ ret_code: 0, ret_msg: 'SUCCESS', extra: { query, count } });
        }
        else if (page_size > 0 && current_page > 0) {
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var query = await DeviceModel.find(filter).sort(sort).skip(skipnum).limit(page_size);
            res.send({ ret_code: 0, ret_msg: 'SUCCESS', extra: { query } });
        }
        else {
            res.send({ ret_code: 1002, ret_msg: 'FAILED', extra: '用户输入参数无效' });
        }

        console.log('device list end');
    }


    async onLineList(req, res, next) {
        deviceHandle.prototype.listOnOffline(req, res, next, 1);
    }


    async offLineList(req, res, next) {
        deviceHandle.prototype.listOnOffline(req, res, next, 0);
    }

    async listOnOffline(req, res, next, myfilter) {
        //获取表单数据，josn
        var page_size = req.body['page_size'];
        var current_page = req.body['current_page'];
        var sort = req.body['sort'];
        var filter = req.body['filter'];

        // 如果没有定义排序规则，添加默认排序
        if (typeof (sort) === "undefined") {
            sort = { "lastTime": -1 };
        }

        // 如果没有定义排序规则，添加默认排序
        if (typeof (filter) === "undefined") {
            filter = { 'deviceStatus': myfilter };
        }
        else {
            filter['deviceStatus'] = myfilter;
        }

        //参数有效性检查
        if (typeof (page_size) === "undefined" && typeof (current_page) === "undefined") {
            var count = await DeviceModel.count(filter);
            var query = await DeviceModel.find(filter).sort(sort).limit(10);
            res.send({ ret_code: 0, ret_msg: 'SUCCESS', extra: { query, count } });
        }
        else if (page_size > 0 && current_page > 0) {
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var query = await DeviceModel.find(filter).sort(sort).skip(skipnum).limit(page_size);
            res.send({ ret_code: 0, ret_msg: 'SUCCESS', extra: { query } });
        } else {
            res.send({ ret_code: 1002, ret_msg: 'FAILED', extra: '用户输入参数无效' });
        }
    }

    async updateDeviceFromPing(req) {
        try {
            var gwId = req.query.gw_id;
            var sysUptime = req.query.sys_uptime;
            var sysMemfree = req.query.sys_memfree;
            var sysLoad = req.query.sys_load;
            var cpuUsage = req.query.cpu_usage;
            var ssid = req.query.ssid;
            var version = req.query.version;
            var type = req.query.type; 	// router type
            var name = req.query.name;	// router name
            var channelPath = req.query.channel_path;
            var wiredPassed = req.query.wired_passed;
            var wifidogUptime = req.query.wifidog_uptime;
            var onlineClients = req.query.online_clients;
            var offlineClients = req.query.offline_clients;
            var nfConntrackCount = req.query.nf_conntrack_count;
            var lastTime = Math.round(+new Date() / 1000);
            var remoteAddress = req.connection.remoteAddress;
            var deviceStatus = 1;
	    const device = await DeviceModel.findOne({ gwId: gwId });
	    if(device){
		channelPath = device.channelPath;

		const newDevice = {
			gwId,
			sysUptime,
			sysMemfree,
			sysLoad,
			cpuUsage,
			ssid,
			version,
			type,
			name,
			channelPath,
			wiredPassed,
			wifidogUptime,
			onlineClients,
			offlineClients,
			nfConntrackCount,
			lastTime,
			remoteAddress,
			deviceStatus
		}

		await DeviceModel.findOneAndUpdate({ gwId }, { $set: newDevice });
	    }
        } catch (err) {
            console.log(err);
        }
    }

    async deviceSetting(gwId) {
	try {
		let channelPath;
		const gateway = await DeviceModel.findOne({ gwId: gwId });
		if (gateway) {
			channelPath = await ChannelPathModel.findOne({ channelPath: gateway.channelPath });
			if (channelPath)
				return channelPath;
			else {
				return null;
			}
		} else {
			var mytime = new Date();
			var gwSetting = { 
					'gwId': gwId, 
					'channelPath': "wificoin",
					'auth': 1,
					'lastTime':mytime.getTime()
			};
			await DeviceModel.create(gwSetting);
			channelPath = await ChannelPathModel.findOne({ channelPath: "wificoin" });
			if (!channelPath) {
				channelPath = await ChannelPathModel.create({ channelPath: "wificoin" });
				return channelPath;
			} else {
				return channelPath;
			}
		}
	} catch (err) {
		console.log(err);
	}
	return null;
    }

    async updateDeviceStatus() {
        var currentTime = Math.round(+new Date() / 1000);
        var devices = await DeviceModel.find();
        for (var i = 0; i < devices.length; i++) {
            var device = devices[i];
            if ((currentTime - device.lastTime) > config.offlineInterval) {
                await DeviceModel.update({ gwId: device.gwId }, { deviceStatus: 0 });
                devClient.update_device_clients_status(device.gwId, 0);
            }
        }
    }
}

const DeviceHandle = new deviceHandle();

export default DeviceHandle;
var scheduleTime = '';
schedule.scheduleJob(scheduleTime, DeviceHandle.updateDeviceStatus);
