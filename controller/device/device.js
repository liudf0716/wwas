'use strict';
import MqttPubHandle from '../../controller-mqtt/publish/mqtt_pub.js';
import MqttSubHandle from "../../controller-mqtt/subscribe/mqtt_sub.js";
//import MqttSubHandle from '../../controller-mqtt/subscribe/mqtt_sub.js';
import DB from "../../models/models.js";
import dtime from 'time-formater';
import config from "config-lite";
import logger from '../../logs/logs.js'
const formidable = require('formidable');
const fs = require("fs");
const xlsx = require('node-xlsx');
const moment = require('moment');

//引入事件模块
const events = require("events");

class DeviceHandle {
    constructor(){
        //logger.info('init 111');
    }
    async sysinfo(req, res, next){
        logger.info('device sysinfo');

        //获取表单数据，josn
        var route_macs = req.body['route_mac'];
        //var operator_name = req.body['operator_name'];
        //var user_name = req.body['user_name'];
        //var expired_time = req.body['expired_time'];

        // 参数有效性检查
        if(typeof(route_macs)==="undefined"){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'用户输入参数无效'});
            return;
        }

        //logger.info('device sysinfo', Array.isArray(macs));
        //logger.info('device macs', macs);
        //logger.info('device macs', macs[0]['mac']);

        try{
            //var taskHandle = MqttPubHandle.createTaskHandle(user_name, operator_name, expired_time, route_macs);
            var taskHandle = MqttPubHandle.createPublishHandle(route_macs);
            await MqttPubHandle.CMD_GET.sysinfo(taskHandle);
            logger.info('uuid', taskHandle.uuid);

            // 监听器 #1
            var mylistener = function (mac, mqttJosnObj) {
                //logger.info('Hello :', JSON.stringify(mqttJosnObj));
                if (mac == -1){
                    res.send({ret_code: -1, ret_msg: 'FAILED', extra:'timeout'});
                }
                else {
                    res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:mqttJosnObj});
                }
            }

            //监听事件some_event
            //await MqttSubHandle.addTaskListener(uuid, mycars.length, mylistener, 2000);
            await MqttSubHandle.addOnceListener(taskHandle.uuid, mylistener, 3000);
        }catch(err){
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:err});
            logger.info('获取数据失败');
        }
    }

    async import(req, res, next){
        logger.info('device import');
        //logger.info(req.body);

        //获取表单数据，josn
        var route_macs = req.body['route_mac'];
        var user_name = req.body['user_name'];  //当前渠道名称

        // 参数有效性检查
        if(typeof(route_macs)==="undefined"){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'用户输入参数无效'});
            return;
        }

        //去掉空格， 分割成数组形式
        //"60ACC800ADA2,      60ACC800ADA3, 60ACC800ADA4" ----------》[ '60ACC800ADA2', '60ACC800ADA3', '60ACC800ADA4' ]
        var mac_array = route_macs.replace(/[ ]/g, "").replace(/(\r\n)|(\n)/g, ",").split(/[;,]/);
        //去掉最后的空数组元素，如果输入60ACC800ADA2，分割是最后一个元素是''
        if (mac_array[mac_array.length-1] == ''){
            mac_array.pop();
        }

        try {
            //修改渠道
		var ill_mac = [];
            for (var i = 0; i < mac_array.length; i++) {
                logger.info('mac_array:', mac_array[i]);


                //去掉空格  //mac 地址合法性检查
                var mac = mac_array[i].trim().toUpperCase();;
                if (mac.length != 12 || mac.search(/[^0-9A-F]/gi) >= 0){
                    //不合法， 不导入
                    continue;	
                }

                // 更新DeviceTable, 如果升级ok的话就不更新
                var wherestr = {'mac': mac};

                //如果采用返回值得形式，必须的await
                var query = await DB.DeviceTable.findOne(wherestr).exec();
                if (query != null){
			if(query.user_name === ''){
                   	 	var updatestr = {'user_name': user_name};
                   		 await DB.DeviceTable.findByIdAndUpdate(query['_id'], updatestr).exec();
			}else{
				ill_mac.push(mac_array[i]);
			}
                }
                else{
                    //如果没有，就直接添加一个新的mac
                    var mytime = new Date();
                    var updatestr = {
                        'mac': mac,
                        'user_name': user_name,
                        'status': 'inactive',
                        'dev_type': '',   //设备型号
                        'old_rom_version': '',   //	旧的固件版本
                        'rom_version': '',   //	固件版本
                        'printer_status': 'default',   //打印机状态
                        'box51_status': 'default',   //51盒子状态
                        'location': '',
                        'inet_ip': '',
                        'update_time':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
                        'sort_time':mytime.getTime()
                    };
                    await DB.DeviceTable.create(updatestr);
                }
            }

            //导入完成
	    if(ill_mac.length !== 0){
		res.send({ret_code: 1017, ret_msg: 'HAVE_ILLEGAL_MAC', extra:ill_mac});
	    }else {
		res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: []});
	    }

        }catch(err){
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:err});
        }
    }

    async import_excel(req, res, next){
        logger.info('device import excel');
        //logger.info(req.body);
        logger.info(" ########## POST /upload ####### ");
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
            logger.info('upload file: ', field, value);
            if (field == 'user_name'){
                user_name = value;
            }
        });

        form.on('file', function (field, file) {
            fileName = file.name;
            uploadedPath = file.path
            //logger.info(file);;
            logger.info('upload file: ', fileName, uploadedPath);

            //判断文件类型是否是xlsx
            if (file.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                fileTypeError = true;
            }
        });

        form.on('end', async function () {
            //遍历上传文件
            logger.info('parse end:' + uploadedPath);

            //读取文件内容
            var obj = xlsx.parse(uploadedPath);
            var excelObj=obj[0].data;
            logger.info(excelObj);

            var mac_array = [];
            for(var i in excelObj){
                var value=excelObj[i];
                for(var j in value){
                    mac_array.push(value[j]);
                }
            }

            logger.info(mac_array);
            try {
                //修改渠道
		var ill_mac = [];
                for (var i = 0; i < mac_array.length; i++) {
                    //logger.info('mac_array:', mac_array[i]);

                    //去掉空格  //mac 地址合法性检查
                    var mac = mac_array[i].trim().toUpperCase();
                      if (mac.length != 12 || mac.search(/[^0-9A-F]/gi) >= 0){
                        //不合法， 不导入
                        continue;
                    }

                    // 更新DeviceTable, 如果升级ok的话就不更新
                    var wherestr = {'mac': mac};

                    //如果采用返回值得形式，必须的await
                    var query = await DB.DeviceTable.findOne(wherestr).exec();
                    if (query != null){
			if(query.user_name === ''){
				var updatestr = {'user_name': user_name};
				await DB.DeviceTable.findByIdAndUpdate(query['_id'], updatestr).exec();
			}else{
				ill_mac.push(mac_array[i]);
			}
                    }
                    else{
                        //如果没有，就直接添加一个新的mac
                        var mytime = new Date();
                        var updatestr = {
                            'mac': mac,
                            'user_name': user_name,
                            'status': 'inactive',
                            'dev_type': '',   //设备型号
                            'old_rom_version': '',   //	旧的固件版本
                            'rom_version': '',   //	固件版本
                            'printer_status': 'default',   //打印机状态
                            'box51_status': 'default',   //51盒子状态
                            'location': '',
                            'inet_ip': '',
                            'update_time':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
                            'sort_time':mytime.getTime()
                        };
                        await DB.DeviceTable.create(updatestr);
                    }
                }

		if(ill_mac.length !== 0){
			res.send({ret_code: 1017, ret_msg: 'HAVE_ILLEGAL_MAC', extra: ill_mac});
		}else{
                //导入完成
			res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: uploadedPath});
		}

            }catch(err){
                res.send({ret_code: -1, ret_msg: 'FAILED', extra:err});
            }

            //删除文件
            fs.unlinkSync(uploadedPath);
        });

        form.on('error', function(err) {
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:"上传出错"});
        });


        form.on('aborted', function() {
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:"放弃上传"});
        });

        form.parse(req);
    }

    async leave(req, res, next){
        logger.info('device leave');

        //获取表单数据，josn
        var route_mac = req.body['route_mac'];

        // 参数有效性检查
        if(typeof(route_mac)==="undefined"){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'用户输入参数无效'});
            return;
        }

        try {
            // 更新DeviceTable, 如果升级ok的话就不更新
            var wherestr = {'mac': route_mac};
            var updatestr = {'user_name': ''};
            var query = await DB.DeviceTable.findOneAndUpdate(wherestr, updatestr).exec();

            //退出完成
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: query});

        }catch(err){
            res.send({ret_code: -1, ret_msg: 'FAILED', extra:err});
        }
    }


    async export(req, res,next){
        logger.info('device export');
	var user = req.body.user_account;
	var query = await DB.DeviceTable.find({'user_name':user}).exec();
	var macs=[];
	for(var i =0; i< query.length; i ++){
		macs.push([query[i].mac]);
	}
	var datas = xlsx.build([
			{name:user, data:macs}
			]);
	var time = moment().format('YYYYMMDDHHMMSS');
	var file_path='/device/'+ time +'.xlsx';
	var write_path = './public'+file_path;
	fs.writeFileSync(write_path, datas,{'flag':'w'});
	res.send({ret_code:0, ret_msg:'SUCCESS',extra: file_path});
    }

    async status(req, res, next) {

    }

    ///权限控制
    async permission(req, res, next) {

        logger.info('access_permission list');

        //本地调试
        if (process.env.NODE_ENV == 'local') {
            next();
            return;
        }

        //超级管理员
        if(req.session.user_type == 0){
            next();
            return;
        }


        try {
            var filter = req.body['filter'];

            // 如果没有定义排序规则，添加默认排序
            if(typeof(filter)==="undefined"){
                res.send({ret_code:1014, ret_msg: 'FAILED', extra:'需要指定渠道'});
                return;
            }

            if(filter['user_name'] == req.session.user_account){
                next();
                return;
            }
            else{
                res.send({ret_code:1015, ret_msg: 'FAILED', extra:'用户名和对应渠道不一致'});
                return;
            }

        }catch(err){
            res.send({ret_code:1009, ret_msg: 'FAILED', extra:'路径访问权限不够'});
        }

    }


    async list(req, res, next) {

        logger.info('device list');
        //logger.info(req.body);

        //获取表单数据，josn
        var page_size = req.body['page_size'];
        var current_page = req.body['current_page'];
        var sort = req.body['sort'];
        var filter = req.body['filter'];

        // 如果没有定义排序规则，添加默认排序
        if(typeof(sort)==="undefined"){
            logger.info('sort undefined');
            sort = {"sort_time":-1};
        }


        // 如果没有定义排序规则，添加默认排序
        if(typeof(filter)==="undefined"){
            logger.info('sort undefined');
            filter = {};
        }

        //参数有效性检查
        if(typeof(page_size)==="undefined" && typeof(current_page)==="undefined"){
            var count = await DB.DeviceTable.count(filter);
            var query = await DB.DeviceTable.find(filter).sort(sort).limit(10);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: {query,count}});
        }
        else if (page_size > 0 && current_page > 0) {
            //var ret = await DB.DeviceTable.findByPage(filter, page_size, current_page, sort);
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var query = await DB.DeviceTable.find(filter).sort(sort).skip(skipnum).limit(page_size);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: {query}});
        }
        else{
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra: '用户输入参数无效'});
        }

        logger.info('device list end');
    }


    async onLineList(req, res, next){

        logger.info('device online');
        //logger.info(req.body);

        DeviceHandle.prototype.listOnOffline(req, res, next, 'online');

        logger.info('device online end');
    }


    async offLineList(req, res, next){

        logger.info('device offline');
        //logger.info(req.body);

        DeviceHandle.prototype.listOnOffline(req, res, next, 'offline');

        logger.info('device offline end');
    }



    async listOnOffline(req, res, next, myfilter){

        //logger.info(req.body);

        //获取表单数据，josn
        var page_size = req.body['page_size'];
        var current_page = req.body['current_page'];
        var sort = req.body['sort'];
        var filter = req.body['filter'];

        // 如果没有定义排序规则，添加默认排序
        if(typeof(sort)==="undefined"){
            logger.info('sort undefined');
            sort = {"sort_time":-1};
        }

        // 如果没有定义排序规则，添加默认排序
        if(typeof(filter)==="undefined"){
            logger.info('filter undefined');
            filter = {'status' : myfilter};
        }
        else{
            filter['status'] = myfilter;
        }

        //参数有效性检查
        if(typeof(page_size)==="undefined" && typeof(current_page)==="undefined"){
            var count = await DB.DeviceTable.count(filter);
            var query = await DB.DeviceTable.find(filter).sort(sort).limit(10);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: {query,count}});
        }
        else if (page_size > 0 && current_page > 0) {
            //var ret = await DB.DeviceTable.findByPage(condition, page_size, current_page, sort);
            var skipnum = (current_page - 1) * page_size;   //跳过数
            var query = await DB.DeviceTable.find(filter).sort(sort).skip(skipnum).limit(page_size);
            res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: {query}});
        }
        else{
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra: '用户输入参数无效'});
        }

    }



    /**
     * 更新设备数据库, 如果没有找到对应记录，不新增
     *
     * @param {String} [newJsonMsg] - message to publish
     * @returns {MqttClient} this - for chaining
     * @api public
     *
     * @example updateTaskContent(uuid, mac, topic, newJsonMsg);
     */
    async updat51boxStatus(mac, status){

        var mytime = new Date();
        var wherestr = {'mac':mac};
        var updatestr = {
            'mac': mac,
            'box51_status': status,
            'update_time':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
            'sort_time':mytime.getTime()
        };

        await DB.DeviceTable.findOneAndUpdate(wherestr, updatestr).exec();
    }


    /**
     * 更新设备数据库, 如果没有找到对应记录，不新增
     *
     * @param {String} [newJsonMsg] - message to publish
     * @returns {MqttClient} this - for chaining
     * @api public
     *
     * @example updateTaskContent(uuid, mac, topic, newJsonMsg);
     */
    async updatPrinterStatus(mac, status){

        var mytime = new Date();
        var wherestr = {'mac':mac};
        var updatestr = {
            'mac': mac,
            'printer_status': status,
            'update_time':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
            'sort_time':mytime.getTime()
        };

        await DB.DeviceTable.findOneAndUpdate(wherestr, updatestr).exec();
    }

}


export default new DeviceHandle();


// 监听器 #1
var updateSysinfo = async function (mac, josnObj) {
    //logger.info('Hello updateSysinfo:', JSON.stringify(josnObj));

    //更新到设备数据库，sysinfo库
    //SysinfoTable
    var wherestr = { 'mac': josnObj['mac']};
    DB.SysinfoTable.findOneAndUpdate(wherestr, josnObj).exec(function (err, doc) {
        if (doc == null){
            //logger.info('query is null');
            var query = DB.SysinfoTable.create(josnObj);
        }
    });
}


// 监听器 #1
var updateOnlineDevice = async function (mac, josnObj) {
    //logger.info('Hello updateOnlineDevice:', JSON.stringify(josnObj));

    var mytime = new Date();

    //更新到设备数据库， 设备上线，下线
    var wherestr = {'mac': mac};
    var updatestr = {
        'mac': mac,
        'status': 'online',
        'dev_type': josnObj.boardtype,   //设备型号
        'old_rom_version': '',   //	旧的固件版本
        'rom_version': josnObj.fwversion,   //	固件版本
        'printer_status': 'default',   //打印机状态
        'box51_status': 'default',   //51盒子状态
        'update_time':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
        'sort_time':mytime.getTime()
    };

    //如果采用返回值得形式，必须的await
    var query = await DB.DeviceTable.findOne(wherestr).exec();
    if (query != null){
        if (query['rom_version'] != josnObj.fwversion){
            updatestr['old_rom_version'] = query['rom_version'];
            await DB.DeviceTable.findByIdAndUpdate(query['_id'], updatestr).exec();
        }
        else if (query['dev_type'] != josnObj.boardtype){
            await DB.DeviceTable.findByIdAndUpdate(query['_id'], {'dev_type': josnObj.boardtype}).exec();
        }
    }
    else{
        await DB.DeviceTable.create(updatestr);
    }
}

// 监听器 #1
var updatDeviceStatus = async function (mac, status) {
    //logger.info('Hello updatDeviceStatus:', status);
    var mytime = new Date();

    //更新到设备数据库
    var wherestr = {'mac': mac};
    var updatestr = {
        'mac': mac,
        'status': status,
        'update_time':dtime(mytime).format('YYYY-MM-DD HH:mm:ss'),
        'sort_time':mytime.getTime(),
        'logs': [],
    };

    var query = await DB.DeviceTable.findOne(wherestr).exec();
    if (query != null){
        //复制数组，logs记录上下线日志
        updatestr['logs'] = query['logs'].slice();
        updatestr['logs'].push(updatestr['update_time'] + ' ' + status);
        if (updatestr['logs'].length > 10){
            updatestr['logs'].shift();  //删除数组第一个元素
        }
        await DB.DeviceTable.findByIdAndUpdate(query['_id'], updatestr).exec();
    }
}


//监听事件some_event
MqttSubHandle.addLoopListener('sysinfo', updateSysinfo);
MqttSubHandle.addLoopListener('sysinfo', updateOnlineDevice);
MqttSubHandle.addLoopListener('$SYS', updatDeviceStatus);
