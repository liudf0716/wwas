'use strict';

import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const adminSchema = new Schema({
	user_account: String,
	user_password: String,
	user_name: String,
	user_phone: String,
	user_create_time: String,
	user_last_login_time: String,
	user_admin: String, 
	user_type: Number, //0:超级用户, 1:普通管理员
	user_status: Number, //0:用户正常,1:用户冻结
	user_avatar: {type: String, default: 'default.jpg'},
	user_city: String,
	user_device_count: Number, //该用户所有的设备数
	user_online_count: Number, //该用户在线的设备数
})

const Admin = mongoose.model('Admin',adminSchema);

export default Admin
