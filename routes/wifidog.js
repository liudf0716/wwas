'use strict';

import express from 'express'
import Wifidog from '../controller/wifidog/wifidog'
const router = express.Router();

router.get('/ping', Wifidog.ping);
router.get('/auth', Wifidog.auth);
router.get('/login', Wifidog.login);
router.get('/portal', Wifidog.portal);
router.get('/auth/wfc', Wifidog.authWfc);
router.get('/auth/weixin', Wifidog.authWeixin);

export default router
