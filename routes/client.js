'use strict';

import express from 'express'
import client from '../controller/client/client'
import check from '../middlewares/check'
const router = express.Router();

router.all('/list', client.list); // list client of the router

router.all('/export', client.export); // export channel client

router.all('/kickoffClient', client.kickOffClient); // kickoff online client

export default router
