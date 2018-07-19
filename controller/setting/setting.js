'use strict'

import GatewayIdModel	from '../../models/setting/gatewayid'
import ChannelPathModel from '../../models/setting/channelpath'

class Setting {
	constructor() {
	}
    
    /*
     * configure router's login and portal by gwid
     */
    async gwidConfig(req, res, next){
        try {
            var gwId = req.body.gwId;
            var gwidConfig = {
                'gwId': gwId,
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
            const result = await GatewayIdModel.findOneAndUpdate({'gwId': gwId}, gwidConfig, {new:true});
            if(!result){
                await GatewayIdModel.create(gwidConfig);
            }
        }catch(err){
            console.log(err);
        }
    }
    
     /*
     * configure router's login and portal by channelPath
     */
    async channelpathConfig(req, res, next){
        try {
            var channelPath = req.body.channelPath;
            var channelPathConfig = {
                'channelPath': channelPath,
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
            const result = await ChannelPathModel.findOneAndUpdate({'channelPath': channelPath}, channelPathConfig, {new:true});
            if(!result){
                await ChannelPathModel.create(channelPathConfig);
            }
        }catch(err){
            console.log(err);
        }
    }
}

export default new Setting()
