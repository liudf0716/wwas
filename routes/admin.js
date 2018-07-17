'use strict';

import express from 'express'
import Admin from '../controller/admin/admin'
import Check from '../middlewares/check'
const router = express.Router()

console.log("enter route of admin");

router.all('/login', /*Check.checkAdminStatus,*/ Admin.login);
router.all('/register',Check.checkSuperAdmin, Admin.register);
router.all('/logout', Check.checkAdminStatus,Admin.singout);
router.all('/change',/* Check.checkSuperAdmin,*/ Admin.changePassword);
router.all('/reset', Check.checkSuperAdmin, Admin.resetPassword);
router.all('/revoke',Check.checkSuperAdmin, Admin.revoke);
router.all('/restore',Check.checkSuperAdmin, Admin.restore);
router.all('/all', Check.checkSuperAdmin, Admin.getAllAdmin);
router.all('/query', Check.checkSuperAdmin, Admin.getQueryAdmin);
router.all('/info',Check.checkAdminStatus, Admin.getAdminInfo);
router.all('/status',Check.checkSuperAdmin, Admin.statusQuery);
//router.all('/count', Admin.getAdminCount);
router.all('/switch',Check.checkSuperAdmin, Admin.switchAdmin);

export default router
