const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456789a', // MySQL kurulumunda belirlediğiniz şifre
  database: 'videochat',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Veritabanı ve tabloları oluştur
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Veritabanını oluştur
    await connection.query('CREATE DATABASE IF NOT EXISTS videochat');
    await connection.query('USE videochat');

    // Users tablosunu oluştur
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(50) NOT NULL,
        lastName VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        isVerified BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        country VARCHAR(100) DEFAULT 'Belirtilmemiş',
        profileImage VARCHAR(255) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        website VARCHAR(255) DEFAULT NULL,
        socialMedia JSON DEFAULT NULL
      )
    `);

    // Blog posts tablosunu oluştur
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    console.log('Veritabanı ve tablolar başarıyla oluşturuldu');
    connection.release();
  } catch (error) {
    console.error('Veritabanı başlatma hatası:', error);
    process.exit(1);
  }
}

// Bağlantıyı test et ve tabloları oluştur
pool.getConnection()
  .then(async (connection) => {
    console.log('MySQL bağlantısı başarılı');
    connection.release();
    
    // Veritabanı ve tabloları oluştur
    await initializeDatabase();
    
    // Tablo yapısını kontrol et
    const [rows] = await pool.query('DESCRIBE users');
    console.log('Users tablosu yapısı:', rows);
  })
  .catch(err => {
    console.error('MySQL hatası:', err);
    process.exit(1);
  });

module.exports = pool; 