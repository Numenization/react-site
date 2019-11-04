const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const argon2 = require('argon2');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

var db = new Database('data.db', { verbose: console.log });

const users = require('./users.js');
users.setDatabase(db);
var User = users.User;

const newDbStmt = db.prepare(
  'CREATE TABLE IF NOT EXISTS users (' +
    'id VARCHAR(255) PRIMARY KEY,' +
    'username VARCHAR(30) UNIQUE NOT NULL,' +
    'email VARCHAR(255) UNIQUE NOT NULL,' +
    'pass VARCHAR(512) NOT NULL,' +
    'salt VARCHAR(512) NOT NULL,' +
    'accountType INTEGER NOT NULL DEFAULT 0' +
    ');'
);
if (!fs.existsSync('data.db')) {
  newDbStmt.run();
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ===================== EXPRESS ROUTES ===========================

app.use(express.static(path.join(__dirname, '../public/dist')));

app.post('/api/register', async (req, res) => {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  if (!username || !email || !password) {
    res.status(400).json({
      error: `Invalid credentials - Username: ${username} Email: ${email} Password: ${password}`
    });
    return;
  }

  var options = {
    username: username,
    email: email,
    pass: password
  };

  const verification = verifyInformation(options);

  if (!(verification === true)) {
    res.status(400).json({ error: verification });
    console.log(verification);
    return;
  }

  var salt = crypto.randomBytes(32).toString('hex');
  var saltedPass = password + salt;

  argon2.hash(saltedPass, { type: argon2.argon2id }).then(async result => {
    var parsedResult = result.split('$');
    options = {
      username: username,
      email: email,
      salt: salt,
      pass: parsedResult[5]
    };

    // insert user into db
    var user = new User(username, email, parsedResult[5], salt);
    user.insert();
  });
});

app.get('/api/users/all/', (req, res) => {
  // get all users and return as array
  var users = User.getAll();

  res.json(JSON.stringify(users));
});

app.delete('/api/users/', (req, res) => {
  // delete a user

  // this is where we should check if the user requesting this is an admin
  if (!req.body.id) {
    res.status(400).json({
      message: 'Bad post request: must have "id" (string)'
    });
  }
  console.log(`Trying to delete person with ID ${req.body.id}`);

  const user = User.get(req.body.id);
  const info = user.delete();

  console.log(info);
});

app.get('/api/users/', (req, res) => {
  // get a specific user with query id
  var id = req.query.id;
  if (!id) {
    res.status(400).json({ error: 'Bad request, missing or invalid ID' });
    return;
  }

  var user = User.get(id);
  if (!user instanceof User) {
    res.status(500).json({ error: 'Error in fetching from database' });
  }

  res.json(JSON.stringify(user.stripped()));
});

app.get('/*', (req, res) => {
  // just send em the homepage
  res.sendFile(path.join(__dirname, 'public/dist/index.html'), err => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// ========================= HELPER FUNCTIONS ==========================

function verifyInformation(options) {
  var status = 'good';

  // verify username length
  if (options.username.length > 30) {
    status = 'Username is too long!';
    return status;
  }

  // verify email format
  if (!isEmail(options.email)) {
    status = 'Email is invalid!';
    return status;
  }

  // verify password format
  //if (!isValidPassword(options.pass)) {
  //  return "Password is invalid!";
  //}

  // verify username and email is unique
  const unique = User.checkUnique(options.username, options.email);

  if (unique === true) {
    return true;
  } else {
    status = unique.message;
    return status;
  }
}

function isEmail(str) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(str);
}

function isValidPassword(str) {
  var reg = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  return reg.test(str);
}

app.listen(PORT);
