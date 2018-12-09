'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const channelPathSchema = new Schema({
	user_account: String,
    user_password: String,
    user_name: {type: String, default:''},
    user_phone: {type: String, default:''},
    user_create_time: String,
    user_last_login_time: String,
    user_admin: String,
    user_type: {type:Number, default: 0}, //0:超级用户, 1:普通管理员
    user_status: Number, //0:用户正常,1:用户冻结
    user_avatar: {type: String, default: 'default.jpg'},
    user_city: String,
    user_device_count: Number, //该用户所有的设备数
    user_online_count: Number, //该用户在线的设备数
	channelPath: {type: String, default: 'wificoin'},
	weixin: {
		appId: {type: String, default: 'wxfb684aa755dffceb'},
		shopId: {type: String, default: '641418'},
		secretKey: {type: String, default: 'ca0ddbac646160edfeaf343937f73404'},
		ssid: {type: String, default: 'ApFreeWiFiDog'}
	},
	wificoin: {
		toAddress: {type: String, default: 'wZirordpuoJgmRp6wRPKZjAjVruQr5gF7r'},
		toAmount: {type: Number, default: 2000000},
	},
	sms: {
		appId: {type:String, default: ''},
		appSecret:{type:String, default:''},
		smsSignName:{type:String, default:''},
		smsTemplateCode:{type:String, default:''},
		wyAppId: {type: String, default: ''},
		wyAppSecret: {type: String, default: ''},
		wyTemplateId: {type: String, default: ''},
		selected: {type:String, default: ''},
	},
    user: {
        user: {type:String, default:'wificoin'},
        password: {type:String, default:''},
    }
	portalUrl: {type: String, default: 'https://talkblock.org/'},
	duration: {type: Number, default: 3600}
})

channelPathSchema.index({channelPath: 1});

const ChannelPath = mongoose.model('ChannelPath', channelPathSchema);


export default ChannelPath
