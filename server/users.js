const argon2 = require("argon2");
const Database = require("better-sqlite3");
const uuid = require("uuid/v1");

var db = null;

function setDatabase(database) {
  if (!(database instanceof Database)) {
    console.error(
      "Users database argument is either missing or not a sqlite3 database!"
    );
  }
  db = database;
}

class User {
  constructor(name, email, pass, salt, id = null, rowid = null) {
    this._username = name;
    this._email = email;
    this._pass = pass;
    this._salt = salt;
    if(id) {
      this._id = id;
    } else {
      this._id = uuid();
    }
    this._rowid = rowid;
    this._accountType = 0;
  }

  set accountType(accountType) {
    this._accountType = accountType;
  }

  get accountType() {
    return this._accountType;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._username;
  }

  get email() {
    return this._email;
  }

  get salt() {
    return this._salt;
  }

  // Tries to validate the user with a given hash
  async validate(hash) {
    if (!this._id) {
      return new Error("ID is not set for user validation!");
    }

    if (!this._pass || !this._salt)
      return new Error("User pass or salt missing in validation!");

    if (await argon2.verify(hash + this._salt, this._pass)) {
      return true;
    } else {
      return Error("Password is incorrect!");
    }
  }

  insert() {
    // if we have an ID already we should check and see if we're in the db already
    var errorStatus;
    if (this._id) {
      const findIdStmt = db.prepare(
        "SELECT username username FROM users WHERE id=?"
      );
      const findId = findIdStmt.get(this._id);
      if (findId) {
        return new Error("User already in database!");
      }
    }

    //if (errorStatus) return errorStatus;

    // now lets check and see if we have a unique email and username
    const emailUsernameStmt = db.prepare("SELECT * FROM users");
    for (const user of emailUsernameStmt.iterate()) {
      if (user.username == this._username || user.email == this._email) {
        return new Error("User already in database!");
      }
    }

    // should be good to insert into database now
    const stmt = db.prepare(
      "INSERT INTO users (id, username, email, pass, salt) VALUES(?,?,?,?,?)"
    );
    const info = stmt.run(
      this._id,
      this._username,
      this._email,
      this._pass,
      this._salt
    );

    if (info.changes == 0) {
      // error in inserting
      return new Error("Error in inserting into DB");
    } else {
      return true;
    }
  }

  // TODO: implement
  // Updates a user's values in the DB with a given user
  update() {}

  // returns a version of the user object that is safe to send to clients
  // ie, no salt or password included
  stripped() {
    return {
      id: this._id,
      rowid: this._rowid,
      username: this._username,
      email: this._email
    }
  }

  // Returns a new user object with properties fetched from DB with given ID
  static get(id) {
    var username;
    var email;
    var pass;
    var salt;
    var accountType;
    var rowid;

    const stmt = db.prepare(
      "SELECT username username, email email, pass pass, salt salt, accountType accountType, rowid rowid FROM users WHERE id=?"
    );
    const row = stmt.get(id);

    if (row instanceof Error) {
      return row;
    }

    if (row === undefined) {
      return new Error(`User not found with ID ${id}`);
    }

    username = row.username;
    email = row.email;
    pass = row.pass;
    salt = row.salt;
    accountType = row.accountType;
    rowid = row.rowid;

    var user = new User(username, email, pass, salt, id, rowid);
    user.accountType = accountType;

    return user;
  }

  static getAll() {
    const stmt = db.prepare("SELECT id, username, email, rowid FROM users");
    const users = stmt.all();

    return users;
  }

  // TODO: implement
  // Deletes a user from the DB with a given ID
  static async delete(id) {
    const stmt = db.prepare("DELETE FROM users WHERE id=?");
    const info = stmt.run(id);

    return info;
  }

  static checkUnique(username, email) {
    // check username
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    const result = stmt.get(username);
    if(!result === undefined) {
      // error
      return new Error("Username is already in use!");
    }

    const stmt2 = db.prepare("SELECT * FROM users WHERE email = ?");
    const result2 = stmt2.get(email);
    if(!result === undefined) {
      return new Error("Email is already in use!");
    }

    return true;
  }
}

module.exports = {
  User: User,
  setDatabase: setDatabase
};
