const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use('/customer', session({ secret: 'fingerprint_customer', resave: true, saveUninitialized: true, cookie: { secure: false } }));

app.use('/customer/auth/*', function auth(req, res, next) {
	if (req.session.authorization) {
		let token = req.session.authorization['accessToken'];
		jwt.verify(token, 'access', (err, user) => {
			if (err) {
				return res.status(403).json({ message: 'User not authenticated' });
			}
			req.user = { name: user.data?.name };
			next();
		});
	} else {
		return res.status(403).json({ message: 'User not logged in' });
	}
});

const PORT = 5010;

app.use('/customer', customer_routes);
app.use('/', genl_routes);

app.listen(PORT, () => console.log('Server is running'));
