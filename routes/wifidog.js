'use strict';

import express from 'express'
import WiFiDog from '../controller/wifidog/wifidog'
const router = express.Router();

router.get('/ping', WiFiDog.checkPingParam, WiFiDog.ping);
router.get('/offline', WiFiDog.checkPingParam, WiFiDog.offline);
router.all('/auth', WiFiDog.checkAuthParam, WiFiDog.auth);
router.get('/login', WiFiDog.checkLoginParam,  WiFiDog.login);
router.get('/portal', WiFiDog.checkPortalParam,  WiFiDog.portal);
router.get('/auth/wfc', WiFiDog.checkAuthWfcParam, WiFiDog.authWfc);
router.get('/auth/weixin', WiFiDog.checkAuthWeixinParam, WiFiDog.authWeixin);
router.get('/auth/sms', WiFiDog.checkAuthSmsParam, WiFiDog.authSMS);
router.get('/auth/check', WiFiDog.checkCodeSmsParam, WiFiDog.checkSMS);

export default router
