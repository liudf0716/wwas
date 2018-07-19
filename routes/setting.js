'use strict';

import express from 'express'
import Setting from '../controller/setting/setting'
const router = express.Router();

router.post('/setConfig', Setting.setConfig);

export default router
