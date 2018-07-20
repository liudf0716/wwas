'use strict';

import express from 'express'
import Client from '../controller/setting/client'
import Check from '../middlewares/check'
const router = express.Router();

router.all('/list', Client.list); // list all client of the router
router.all('/list/online', Client.listOnline); // list all online clients of the router
router.all('/list/offline', Client.listOffline);
route.all('/cplist', Client.cpList); // list all online clients of the channelpath
route.all('/cplist/online', Client.cplistOnline); // list all online clients of the channelpath
route.all('/cplist/offline', Client.cplistOffline);

export default router
