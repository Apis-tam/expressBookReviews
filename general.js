const express = require('express');
const axios = require('axios').defaults;
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();

public_users.post('/register', (req, res) => {
	const registerUser = req.body.user;
	if (!registerUser.name || !registerUser.password) {
		return res.status(400).json({ message: 'Please write user name and password' });
	}
	if (users.length === 0 || isValid(registerUser.name)) {
		users.push(registerUser);
		return res.status(200).json({ message: `Registration was successful` });
	}

	return res.status(409).json({ message: `User ${registerUser.name} already registered` });
});

//Get the book list available in the shop
public_users.get('/', (req, res) => {
	new Promise((resolve, reject) => {
		if (Object.values(books).length) {
			resolve(books);
		} else {
			reject("Didn't find books");
		}
	})
		.then((data) => res.status(200).json({ message: data }))
		.catch((err) => res.status(500).json(err));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
	const bookId = req.params.isbn;

	new Promise((resolve, reject) => {
		if (books[bookId]) {
			resolve(books[bookId]);
		} else {
			reject('Book not found');
		}
	})
		.then((data) => res.status(200).json({ message: data }))
		.catch((err) => res.status(404).json({ message: err }));
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
	const searchingAuthor = req.params.author.toLowerCase();
	new Promise((resolve, reject) => {
		let foundBook = [];
		for (key in books) {
			if (books[key].author.toLowerCase().includes(searchingAuthor)) {
				foundBook.push(books[key]);
			}
		}
		if (foundBook.length) {
			return resolve(foundBook);
		}
		return reject('Did not find Author');
	})
		.then((data) => res.status(200).json({ message: data }))
		.catch((err) => res.status(404).json({ message: err }));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
	const searchingTitle = req.params.title.toLowerCase();

	new Promise((resolve, reject) => {
		let foundBook = [];
		for (key in books) {
			if (books[key].title.toLowerCase().includes(searchingTitle)) {
				foundBook.push(books[key]);
			}
		}
		if (foundBook.length) {
			return resolve(foundBook);
		}
		return reject('Did not find book');
	})
		.then((data) => res.status(200).json({ message: data }))
		.catch((err) => res.status(404).json({ message: err }));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
	const bookId = req.params.isbn;

	if (books[bookId]) {
		const hasReviews = Object.values(books[bookId].reviews).length;
		return res.status(200).json({ message: hasReviews ? books[bookId].reviews : 'This book has not reviews yet' });
	}
	return res.status(404).json({ message: 'Did not find book' });
});

module.exports.general = public_users;
