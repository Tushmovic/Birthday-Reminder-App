const { getDb } = require('../database');

class User {
  static create({ username, email, dateOfBirth }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sql = 'INSERT INTO users (username, email, date_of_birth) VALUES (?, ?, ?)';
      
      db.run(sql, [username, email, dateOfBirth], function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            reject(new Error('Email already exists'));
          } else {
            reject(err);
          }
        } else {
          resolve({ id: this.lastID, username, email, date_of_birth: dateOfBirth });
        }
      });
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sql = 'SELECT * FROM users ORDER BY created_at DESC';
      
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static findByBirthday(month, day) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sql = `
        SELECT * FROM users 
        WHERE strftime('%m', date_of_birth) = ? 
        AND strftime('%d', date_of_birth) = ?
      `;
      
      db.all(sql, [month, day], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static markBirthdaySent(userId, year) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sql = 'INSERT INTO sent_birthdays (user_id, sent_date, sent_year) VALUES (?, DATE("now"), ?)';
      
      db.run(sql, [userId, year], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static isBirthdaySent(userId, year) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sql = 'SELECT 1 FROM sent_birthdays WHERE user_id = ? AND sent_year = ?';
      
      db.get(sql, [userId, year], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
  }
}

module.exports = User;