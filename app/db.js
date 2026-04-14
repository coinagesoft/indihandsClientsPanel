// db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();


// export const db = mysql.createPool({
//   host: "localhost",   // 🔥 IMPORTANT (not live server)
//   user: "root",
//   password: "NewPassword123!", // or "" if none
//   database: "indihand_backup",     // ✅ your imported schema
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// export const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

export const db = mysql.createPool({
  host: "217.21.74.127",
  user: "u856729253_indihandsport",
  password: "oPSOg3#a2P>",
  database: "u856729253_Indihands",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})


// export const db = mysql.createPool({
//   host: "46.28.45.124",
//   user: "u144125849_Indicat",
//   password: "wozvis-fipnez-kyvCe4",
//   database: "u144125849_catalog",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// Test connection
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ DB Connected Successfully!');
    connection.release();
  } catch (err) {
    console.error('❌ DB Connection Failed:', err.message);
  }
})();
