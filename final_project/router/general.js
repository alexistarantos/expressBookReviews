const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Unable to register user."});
  }

  if (!isValid(username)) {
    return res.status(404).json({message: "User already exists!"});
  }
  
  users.push({"username": username, "password": password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop (Task 10 - async/await with Axios)
function getBookList() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Object.keys(books).length === 0) {
        reject(new Error("Books not found"));
      } else {
        resolve(books);
      }
    }, 1000);
  });
}

public_users.get('/', async (req, res) => {
  try {
    const [data] = await axios.all([getBookList()]);
    return res.status(200).json({books: data});
  } catch (err) {
    return res.status(404).json({message: err.message});
  }
});

// Get book details based on ISBN (Task 11 - Promise callbacks with Axios)
function getBookDetails(isbn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found"));
      }
    }, 1000);
  });
}

public_users.get('/isbn/:isbn', function (req, res) {
  let isbn = req.params.isbn;

  axios.all([getBookDetails(isbn)])
    .then(([book]) => {
      return res.status(200).send(JSON.stringify(book, null, 4));
    })
    .catch((err) => {
      return res.status(404).json({ message: err.message });
    });
});

// Get book details based on author (Task 12 - async/await with Axios)
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let matchingBooks = [];

      Object.keys(books).forEach((key) => {
        if (books[key].author === author) {
          matchingBooks.push(books[key]);
        }
      });

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject(new Error("No books found by this author"));
      }
    }, 1000);
  });
}

public_users.get('/author/:author', async (req, res) => {
  let author = req.params.author;

  try {
    const [matchingBooks] = await axios.all([getBooksByAuthor(author)]);
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  } catch (err) {
    return res.status(404).json({message: err.message});
  }
});

// Get all books based on title (Task 13 - Promise callbacks with Axios)
function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let matchingBooks = [];

      Object.keys(books).forEach((key) => {
        if (books[key].title === title) {
          matchingBooks.push(books[key]);
        }
      });

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject(new Error("No books found with this title"));
      }
    }, 1000);
  });
}

public_users.get('/title/:title', function (req, res) {
  let title = req.params.title;

  axios.all([getBooksByTitle(title)])
    .then(([matchingBooks]) => {
      return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    })
    .catch((err) => {
      return res.status(404).json({message: err.message});
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  return res.status(200).send(JSON.stringify(books[isbn].reviews));
});

module.exports.general = public_users;
