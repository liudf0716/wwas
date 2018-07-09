'use strict';

import wifidog from './wifidog'

export default app => {
	// app.get('/', (req, res, next) => {
	// 	res.redirect('/');
	// });
	app.use('/wifidog', wifidog);
}
