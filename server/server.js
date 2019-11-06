const express = require('express');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const Database = require('better-sqlite3');
const argon2 = require('argon2');
const crypto = require('crypto');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5000;

var db = new Database(path.join(__dirname, '../data.db'), {
  verbose: console.log
});
var SQLiteStore = require('connect-sqlite3')(session);

const users = require(path.join(__dirname, './users.js'));
users.setDatabase(db);
var User = users.User;

if (true) {
  db.exec(fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8'));
}

const readStream = readline.createInterface({
  input: fs.createReadStream(path.join(__dirname, '../secret'))
});
readStream.on('line', line => {
  app.use(
    session({
      extended: false,
      name: 'Heyo',
      resave: true,
      saveUninitialized: true,
      secret: line,
      store: new SQLiteStore({
        db: 'sessions',
        dir: path.join(__dirname, '../')
      })
    })
  );
});

// ===================== EXPRESS MIDDLEWARE ======================

var requestTime = function(req, res, next) {
  req.time = Date.now();
  next();
};

var logger = function(req, res, next) {
  console.log(`${req.ip} -> ${req.method}/${req.originalUrl}`);
  next();
};

var authLevel = function(req, res, next) {};

app.use(express.json());
app.use(express.urlencoded());
app.use(requestTime);
app.use(logger);

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
