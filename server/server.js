const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const argon2 = require("argon2");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 5000;

let db = new sqlite3.Database("data.db", err => {
  if (err) return console.error(err);
  console.log("Connected to database");
});

db.run(
  "CREATE TABLE IF NOT EXISTS users (" +
    "id INTEGER PRIMARY KEY," +
    "username VARCHAR(30) NOT NULL," +
    "email VARCHAR(255) NOT NULL," +
    "pass VARCHAR(512) NOT NULL," +
    "salt VARCHAR(512) NOT NULL," +
    "accountType INTEGER NOT NULL DEFAULT 0" +
    ");"
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ===================== EXPRESS ROUTES ===========================

app.use(express.static(path.join(__dirname, "../public/dist")));

app.post("/api/register", async (req, res) => {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  if (!username || !email || !password) {
    res.status(400).json({
      error: `Invalid credentials - Username: ${username} Email: ${email} Password:${password}`
    });
    return;
  }

  var options = {
    username: username,
    email: email,
    pass: password
  };

  await verifyInformation(options, verification => {
    if (!(verification === "good")) {
      res.status(400).json({ error: verification });
      console.log(verification);
      return;
    }
    var salt = crypto.randomBytes(32).toString("hex");
    var saltedPass = password + salt;

    var hashedPass = argon2
      .hash(saltedPass, { type: argon2.argon2id })
      .then(result => {
        var parsedResult = result.split("$");
        options = {
          username: username,
          email: email,
          salt: salt,
          pass: parsedResult[5]
        };

        db.run(
          "INSERT INTO users (id, username, email, pass, salt) VALUES(NULL,?,?,?,?)",
          [options.username, options.email, options.pass, options.salt],
          err => {
            if (err) {
              res.json({ error: `Failed to insert into table: ${err}` });
              return console.error(err);
            }
            console.log(`Added ${options.username} to database`);
            res.json({
              message: `Inserted into table (${options.username} | ${options.email})`
            });
          }
        );
      });
  });
});

app.get("/api/users/all/", (req, res) => {
  let users = [];
  let promise = new Promise((resolve, reject) => {
    db.each(
      "SELECT username username, email email, id id FROM users;",
      (err, row) => {
        if (err) {
          console.error(err);
          reject(Error("Failed to fetch user table"));
        }
        const user = [row.id, row.username, row.email];
        users.push(user);
      },
      (err, count) => {
        if (err) {
          console.error(err);
          reject(Error("Failed to fetch user table"));
        }
        resolve(count);
      }
    );
  });

  promise.then(
    result => {
      if (result > 0) {
        res.json(users);
      } else {
        res.json({ message: "Users table is empty" });
      }
    },
    err => {
      res.status(400).res.json({ message: "Failed to fetch users table" });
    }
  );
});

app.delete("/api/users/", (req, res) => {
  // this is where we should check if the user requesting this is an admin
  console.log("delete");
  if (!req.body.id) {
    res.status(400).json({
      message: 'Bad post request: must have "id" (string)'
    });
  }
  console.log(`Trying to delete person with ID ${req.body.id}`);
  db.run(`DELETE FROM users WHERE id = ?`, req.body.id, err => {
    if (err) {
      res.status(500).json({ message: `Failed to delete from table: ${err}` });
      return console.error(err);
    }
    console.log(`Deleted user with ID ${req.body.id} from database`);
    res.json({ message: `Deleted from table (${req.body.id})` });
  });
});

app.get("/api/users/", (req, res) => {
  var id = req.query.id;
  if (!id || isNaN(id)) {
    res.status(400).json({ message: "Bad request, missing or invalid ID" });
    return;
  }

  db.get(
    "SELECT username username, email email FROM users WHERE id=?",
    id,
    (err, row) => {
      if (err) {
        res.status(400).json({ message: `Bad request: ${err}` });
        return;
      }
      res.json({ id: id, username: row.username, email: row.email });
    }
  );
});

app.get("/*", (req, res) => {
  // just send em the homepage
  res.sendFile(path.join(__dirname, "public/dist/index.html"), err => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// ========================= HELPER FUNCTIONS ==========================

async function verifyInformation(options, cb) {
  var status = "good";

  // verify username length
  if (options.username.length > 30) {
    status = "Username is too long!";
    return status;
  }

  // verify email format
  if (!isEmail(options.email)) {
    status = "Email is invalid!";
    return status;
  }

  // verify password format
  //if (!isValidPassword(options.pass)) {
  //  return "Password is invalid!";
  //}

  // verify username and email is unique
  var promise = new Promise((resolve, reject) => {
    db.each(
      "SELECT username username, email email FROM users;",
      (err, row) => {
        if (row.username === options.username) {
          reject(Error("Username is already in use!"));
        }

        if (row.email === options.email) {
          reject(Error("Email is already in use!"));
        }
      },
      () => {
        resolve("good");
      }
    );
  });
  promise
    .then(result => {
      status = "good";
    })
    .catch(err => {
      status = `${err.message}`;
    })
    .finally(() => {
      cb(status);
    });
}

function isEmail(str) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(str);
}

function isValidPassword(str) {
  var reg = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  return reg.test(str);
}

app.listen(PORT);
