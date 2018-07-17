'use strict';

import wifidog from './wifidog'
import admin_router from './admin.js'
import device_router from './device.js'

export default app => {
	// app.get('/', (req, res, next) => {
	// 	res.redirect('/');
	// });
	app.use('/wifidog', wifidog);
    app.use('/admin', admin_router);
    app.use('/device', device_router);
}
