'use strict';

import wifidog 	from './wifidog'
import admin 	from './admin'
import device 	from './device'
import setting 	from './setting'
import client   from './client'

export default app => {
	// app.get('/', (req, res, next) => {
	// 	res.redirect('/');
	// });
	app.use('/wifidog', wifidog);
    app.use('/admin', admin);
    app.use('/device', device);
	app.use('/setting', setting);
    app.use('/client', client);
}
