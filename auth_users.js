const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [{ name: 'bogdan', password: 123 }];

const isValid = (username) => {
	//returns boolean
	//write code to check is the username is valid
	if (users.length === 0) return true;

	return users.some((user) => user?.name !== username);
};

const authenticatedUser = (username, password) => {
	if (users.length === 0) return false;
	return !!users.find((user) => user.name === username && user.password === password);
};

//only registered users can login
regd_users.post('/login', (req, res) => {
	//Write your code here
	const loginData = req.body.user;
	if (!loginData?.name || !loginData?.password) {
		return res.status(404).json({ message: 'Please write user name and password' });
	}
	if (authenticatedUser(loginData.name, loginData.password)) {
		const accessToken = jwt.sign(
			{
				data: loginData,
			},
			'access',
			{ expiresIn: 3600 }
		);
		req.session.authorization = {
			accessToken,
		};
		req.session.save();
		return res.status(200).json({ message: 'login successful' });
	}

	return res.status(401).json({ message: 'User name or password incorrect' });
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res, next) => {
	const bookId = req.params.isbn;
	if (books[bookId]) {
		books[bookId].reviews[req.user.name] = req.body.review;
		return res.status(200).json({ message: 'Book reviews was updated', data: books[bookId] });
	}
	return res.status(404).json({ message: 'Did not find book' });
});

// Delete a book review
regd_users.delete('/auth/review/:isbn', (req, res, next) => {
	const bookId = req.params.isbn;
	if (books[bookId]) {
		delete books[bookId].reviews[req.user.name];
		return res.status(200).json({ message: 'Book reviews was deleted', data: books[bookId] });
	}
	return res.status(404).json({ message: 'Did not find book' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
