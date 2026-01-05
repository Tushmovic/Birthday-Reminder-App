const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(
      path.join(__dirname, 'database.sqlite'),
      (err) => {
        if (err) {
          console.error('Error connecting to database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          createTables().then(resolve).catch(reject);
        }
      }
    );
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    const usersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        date_of_birth DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const sentBirthdaysTable = `
      CREATE TABLE IF NOT EXISTS sent_birthdays (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        sent_date DATE NOT NULL,
        sent_year INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, sent_year)
      )
    `;

    db.serialize(() => {
      db.run(usersTable, (err) => {
        if (err) reject(err);
      });
      
      db.run(sentBirthdaysTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

module.exports = { initializeDatabase, getDb };