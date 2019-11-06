CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  pass VARCHAR(512) NOT NULL,
  salt VARCHAR(512) NOT NULL,
  accountType INTEGER NOT NULL DEFAULT 0
);