'use strict';

import express from 'express'
import Setting from '../controller/setting/setting'
const router = express.Router();

router.post('/channelpathSetting', Setting.channelpathSetting);
router.post('/gwidSetting', Setting.gwidSetting);

export default router
