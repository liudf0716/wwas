'use strict';

import mongoose from 'mongoose';
//import cityData from '../../InitData/cities'
var ObjectId = mongoose.Schema.Types.ObjectId;

const deviceSchema = new mongoose.Schema({
    mac:String,
    user_name: {type: String, default: ''},    //用户就是渠道，一个mac唯一归属于一个用户
    dev_type: String,   //设备型号
    old_rom_version: String,   //	前一个固件版本
    rom_version: String,   //	固件版本
    //plugin_status: String,   //安装插件
    printer_status: String,   //打印机状态
    box51_status: String,   //51盒子状态
    location: {type: String, default: ''},   //设备位置，精确到市
    inet_ip: {type: String, default: ''},   //外网ip
    status: String,   //设备状态， online:在线，offline:离线，inactive:未激活
    update_time:String, //状态更新时间
    logs: Array,   //一些上下线的日志信息，辅助定位问题，记录5条
    sort_time:Number, //排序时间戳，
});


/**
 * 分页查询
 * find（）   查询商品，
 * limit(),   限制显示文档个数
 * skip();    跳过文档个数，
 * sort(),    这个是排序规则
 * @param {Object} devDocObj - task object
 * @returns {MqttClient} this - for chaining
 * @api public
 *
 * @example getByPager(uuid, mac, topic, newJsonMsg);
 */
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



const DeviceTable = mongoose.model('DeviceTable', deviceSchema);
export {DeviceTable}