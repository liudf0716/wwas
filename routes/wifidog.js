'use strict';

import express from 'express'
import WiFiDog from '../controller/wifidog/wifidog'
const router = express.Router();

router.get('/ping', WiFiDog.ping);
router.get('/auth', WiFiDog.auth);
router.get('/login', WiFiDog.login);
router.get('/portal', WiFiDog.portal);
router.get('/auth/wfc', WiFiDog.authWfc);
router.get('/auth/weixin', WiFiDog.authWeixin);

export default router
