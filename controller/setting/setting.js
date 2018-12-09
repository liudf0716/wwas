'use strict'

import GatewayIdModel	from '../../models/setting/gatewayid'
import ChannelPathModel from '../../models/setting/channelpath'

class Setting {
	constructor() {
	}
    
    /*
     * configure router's login and portal by gwid
     */
    async wfcSetting(req, res, next){
        try {
            //检测此用户session是否超时
            const user = req.session.user_account;
            if (!user) {
                res.send({
                        ret_code: 1001,
                        ret_msg: 'ERROR_SESSION',
                        extra: '亲，您还没有登录',
                });
                return;
            }
            var channelPath = req.body.user_account;
            if(req.body.weixin.ssid == null){
                req.body.weixin.ssid = 'ApFreeWiFiDog';
            }
            if(req.body.sms.selected == 'ali'){
                    var gwidSetting = {
                        'channelPath': channelPath,
                        'wificoin.toAddress':  req.body.wificoin.toAddress,
                        'wificoin.toAmount':   req.body.wificoin.toAmount*1000000,
                        'weixin.appId': req.body.weixin.appId,
                        'weixin.shopId': req.body.weixin.shopId,
                        'weixin.secretKey': req.body.weixin.secretKey,
                        'weixin.ssid':   req.body.weixin.ssid,
                        'sms.appId': req.body.sms.appId,
                        'sms.appSecret': req.body.sms.appSecret,
                        'sms.smsSignName': req.body.sms.smsSignName,
                        'sms.smsTemplateCode': req.body.sms.smsTemplateCode,
                        'sms.selected': req.body.sms.selected,
                        'user.user': req.body.user.user=='undefined'?'wificoin':req.body.user.user,
                        'user.password': req.body.user.password=='undefined'?'wificoin':req.body.user.password,
                        'portalUrl':  req.body.portalUrl,
                        'duration':   req.body.duration*3600
                    };
            }else if(req.body.sms.selected == 'wy'){
                    var gwidSetting = {
                        'channelPath': channelPath,
                        'wificoin.toAddress':  req.body.wificoin.toAddress,
                        'wificoin.toAmount':   req.body.wificoin.toAmount*1000000,
                        'weixin.appId': req.body.weixin.appId,
                        'weixin.shopId': req.body.weixin.shopId,
                        'weixin.secretKey': req.body.weixin.secretKey,
                        'weixin.ssid':   req.body.weixin.ssid,
                        'sms.wyAppId': req.body.sms.wyAppId,
                        'sms.wyAppSecret': req.body.sms.wyAppSecret,
                        'sms.wyTemplateId':req.body.sms.wyTemplateId,
                        'sms.selected': req.body.sms.selected,
                        'user.user': req.body.user.user=='undefined'?'wificoin':req.body.user.user,
                        'user.password': req.body.user.password=='undefined'?'wificoin':req.body.user.password,
                        'portalUrl':  req.body.portalUrl,
                        'duration':   req.body.duration*3600
                    };
            }

            const result = await ChannelPathModel.findOneAndUpdate({'channelPath': channelPath}, gwidSetting, {new:true});
            if(!result){
		        res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'设置失败'});
            }
        }catch(err){
            console.log(err);
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'设置失败'});
        }
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: '设置更新成功'});
    }
    
     /*
     * configure router's login and portal by channelPath
     */
    async weiXinSetting(req, res, next){
        try {
            //检测此用户session是否超时
            const user = req.session.user_account;
            if (!user) {
                res.send({
                        ret_code: 1001,
                        ret_msg: 'ERROR_SESSION',
                        extra: '亲，您还没有登录',
                });
                return;
            }
            var channelPath = req.body.user_account;
            if(req.body.weixin.ssid == null){
                req.body.weixin.ssid = 'ApFreeWiFiDog';
            }
            if(req.body.sms.selected == 'ali'){
                    var gwidSetting = {
                        'channelPath': channelPath,
                        'wificoin.toAddress':  req.body.wificoin.toAddress,
                        'wificoin.toAmount':   req.body.wificoin.toAmount*1000000,
                        'weixin.appId': req.body.weixin.appId,
                        'weixin.shopId': req.body.weixin.shopId,
                        'weixin.secretKey': req.body.weixin.secretKey,
                        'weixin.ssid':   req.body.weixin.ssid,
                        'sms.appId': req.body.sms.appId,
                        'sms.appSecret': req.body.sms.appSecret,
                        'sms.smsSignName': req.body.sms.smsSignName,
                        'sms.smsTemplateCode': req.body.sms.smsTemplateCode,
                        'sms.selected': req.body.sms.selected,
                        'user.user': req.body.user.user=='undefined'?'wificoin':req.body.user.user,
                        'user.password': req.body.user.password=='undefined'?'wificoin':req.body.user.password,
                        'portalUrl':  req.body.portalUrl,
                        'duration':   req.body.duration*3600
                    };
            }else if(req.body.sms.selected == 'wy'){
                    var gwidSetting = {
                        'channelPath': channelPath,
                        'wificoin.toAddress':  req.body.wificoin.toAddress,
                        'wificoin.toAmount':   req.body.wificoin.toAmount*1000000,
                        'weixin.appId': req.body.weixin.appId,
                        'weixin.shopId': req.body.weixin.shopId,
                        'weixin.secretKey': req.body.weixin.secretKey,
                        'weixin.ssid':   req.body.weixin.ssid,
                        'sms.wyAppId': req.body.sms.wyAppId,
                        'sms.wyAppSecret': req.body.sms.wyAppSecret,
                        'sms.wyTemplateId':req.body.sms.wyTemplateId,
                        'sms.selected': req.body.sms.selected,
                        'user.user': req.body.user.user=='undefined'?'wificoin':req.body.user.user,
                        'user.password': req.body.user.password=='undefined'?'wificoin':req.body.user.password,
                        'portalUrl':  req.body.portalUrl,
                        'duration':   req.body.duration*3600
                    };
            }

            const result = await ChannelPathModel.findOneAndUpdate({'channelPath': channelPath}, channelPathSetting, {new:true});
            if(!result){
		        res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'设置失败'});
            }
        }catch(err){
            console.log(err);
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'设置失败'});
        }
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra:'设置成功'});
    }

    async getSetting(req, res, next){
	    try{
            //检测此用户session是否超时
            const user = req.session.user_account;
            if (!user) {
                res.send({
                        ret_code: 1001,
                        ret_msg: 'ERROR_SESSION',
                        extra: '亲，您还没有登录',
                });
                return;
            }
            var admin = req.body.user_account;
            var channelPath = await ChannelPathModel.findOne({'channelPath': admin});
            var result = {
                appId: channelPath.weixin.appId,
                secretKey: channelPath.weixin.secretKey,
                shopId: channelPath.weixin.shopId,
                ssid: channelPath.weixin.ssid,
                toAmount: channelPath.wificoin.toAmount/1000000,
                toAddress: channelPath.wificoin.toAddress,
                smsAppId: channelPath.sms.appId,
                smsAppSecret: channelPath.sms.appSecret,
                smsSignName: channelPath.sms.smsSignName,
                smsTemplateCode: channelPath.sms.smsTemplateCode,
                smsWyAppId: channelPath.sms.wyAppId,
                smsWyAppSecret: channelPath.sms.wyAppSecret,
                smsWyTemplateId: channelPath.sms.wyTemplateId,
                smsSelected: channelPath.sms.selected,
                user: channelPath.user.user,
                password: channelPath.user.password,
                portalUrl: channelPath.portalUrl,
                duration: channelPath.duration/3600
            };
            if(!channelPath){
                res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'获取设置失败'});
            }else{
                res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: result});
            }
        }catch(err){
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra: err.message});
        }
    }
}

export default new Setting()
