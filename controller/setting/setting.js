'use strict'

import GatewayIdModel	from '../../models/setting/gatewayid'
import ChannelPathModel from '../../models/setting/channelpath'

class Setting {
	constructor() {
	}
    
    /*
     * configure router's login and portal by gwid
     */
    async gwidSetting(req, res, next){
        try {
            var gwId = req.body.gwId;
            var gwidSetting = {
                gwId: gwId,
                weixin: {
                    appId: req.body.weixin.appId,
                    shopId: req.body.weixin.shopId,
                    secretKey: req.body.weixin.secretKey,
                    ssid:   req.body.weixin.ssid
                },
                wificoin: {
                    toAddress:  req.body.wificoin.toAddress,
                    toAmount:   req.body.wificoin.toAmount
                },
                portalUrl:  req.body.portalUrl,
                duration:   req.body.duration
            };
            const result = await GatewayIdModel.findOneAndUpdate({'gwId': gwId}, gwidSetting, {new:true});
            if(!result){
                await GatewayIdModel.create(gwidSetting);
            }
        }catch(err){
            console.log(err);
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'用户输入参数无效'});
        }
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: []});
    }
    
     /*
     * configure router's login and portal by channelPath
     */
    async channelpathSetting(req, res, next){
        try {
            var channelPath = req.body.channelPath;
            var channelPathConfig = {
                channelPath: channelPath,
                weixin: {
                    appId: req.body.weixin.appId,
                    shopId: req.body.weixin.shopId,
                    secretKey: req.body.weixin.secretKey,
                    ssid:   req.body.weixin.ssid
                },
                wificoin: {
                    toAddress:  req.body.wificoin.toAddress,
                    toAmount:   req.body.wificoin.toAmount
                },
                portalUrl:  req.body.portalUrl,
                duration:   req.body.duration
            };
            const result = await ChannelPathModel.findOneAndUpdate({'channelPath': channelPath}, channelpathSetting, {new:true});
            if(!result){
                await ChannelPathModel.create(channelpathSetting);
            }
        }catch(err){
            console.log(err);
            res.send({ret_code: 1002, ret_msg: 'FAILED', extra:'用户输入参数无效'});
        }
        res.send({ret_code: 0, ret_msg: 'SUCCESS', extra: []});
    }
}

export default new Setting()
