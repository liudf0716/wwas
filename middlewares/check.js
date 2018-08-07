'use strict';

import ChannelPathModel from '../../models/setting/channelpath'
class Check {
	constructor(){
		
	}
	async checkSuperAdmin(req, res, next){

        const user = req.session.user_account;
		if (!user) {
			res.send({
				ret_code: 1001,
				ret_msg: 'ERROR_SESSION',
				extra: '亲，您还没有登录',
			});
			return;
		}else{
			const admin = await ChannelPathModel.findOne({channelPath: user});
			if (!admin || admin.user_type != 0) {
				res.send({
					ret_code: 1010,
					ret_msg: 'HAS_NO_ACCESS',
					extra: '权限不足',
				});
				return;
			}
		}
		next()
	}
	async checkAdminStatus(req, res, next){
		const user = req.session.user_account;
		if (!user) {
			res.send({
				ret_code: 1001,
				ret_msg: 'ERROR_SESSION',
				extra: '亲，您还没有登录',
			});
			return;
		}else{
			const admin = await ChannelPathModel.findOne({channelPath: user});
			if (!admin || admin.user_status != 0) {
				res.send({
					ret_code: 1011,
					ret_msg: 'ERROR_ADMIN_STATUS',
					extra: '你已经被冻结',
				});
				return;
			}
		}
		next()
	}
}

export default new Check()
