'use strict';

import express from 'express'
import Client from '../controller/setting/client'
import Check from '../middlewares/check'
const router = express.Router();

router.all('/list', Client.list); // list client of the router

export default router
