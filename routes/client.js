'use strict';

import express from 'express'
import Client from '../controller/setting/client'
import Check from '../middlewares/check'
const router = express.Router();

router.all('/devlist', Client.devList);
router.all('/devlist/online', Client.devListOnline);
route.all('/cplist', Client.CPList);
route.all('/cplist/online', Client.CPListOnline);

export default router
