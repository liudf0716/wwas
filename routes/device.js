'use strict';

import express from 'express'
import DeviceHandle from '../controller/device/device.js'
import Check from '../middlewares/check'

const router = express.Router();


console.log("enter route of device");



//给渠道导入要管理的设备（根据mac地址或者特定格式的文件）
router.all('/import', Check.checkSuperAdmin, DeviceHandle.import);
router.all('/import/excel', DeviceHandle.import_excel);


//设备退出渠道
router.all('/leave', DeviceHandle.leave);

//根据用户条件，将终端渠道下的设备以excel文件方式导出。
router.all('/export',Check.checkSuperAdmin, DeviceHandle.export);

//获取渠道下的设备信息列表
router.all('/list', DeviceHandle.permission, DeviceHandle.list);

//获取渠道下的在线设备信息列表
router.all('/list/online', DeviceHandle.permission, DeviceHandle.onLineList);

//获取渠道下的离线设备信息列表
router.all('/list/offline', DeviceHandle.permission, DeviceHandle.offLineList);


export default router
