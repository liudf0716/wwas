'use strict';

import express from 'express'
import Setting from '../controller/setting/setting'
const router = express.Router();

router.post('/wificoin', Setting.wificoinSetting);
router.post('/weixin', Setting.weixinSetting);

export default router
