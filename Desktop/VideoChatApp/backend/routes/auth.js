const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route çalışıyor' });
});

// Şifre validasyonu için yardımcı fonksiyon
function validatePassword(password) {
  if (password.length < 10) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

router.post('/register', async (req, res) => {
  let connection;
  try {
    // CORS başlıklarını ekle
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', true);
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );

    console.log('Gelen veri:', req.body);
    
    const { firstName, lastName, email, password, age } = req.body;

    // Tüm alanların kontrolü
    if (!firstName || !lastName || !email || !password || !age) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
    }

    // Bağlantı al
    connection = await db.getConnection();

    // E-posta kontrolü
    const [existingUser] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kayıtlı' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const [result] = await connection.execute(
      'INSERT INTO users (firstName, lastName, email, password, age, isVerified) VALUES (?, ?, ?, ?, ?, TRUE)',
      [firstName, lastName, email, hashedPassword, age]
    );

    console.log('Kullanıcı kaydedildi:', result.insertId);
    res.status(200).json({ userId: result.insertId });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    // Bağlantıyı serbest bırak
    if (connection) {
      connection.release();
    }
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  let connection;
  try {
    const { email, password } = req.body;
    connection = await db.getConnection();

    const [users] = await connection.execute(
      'SELECT id, firstName, lastName, email, password, profileImage FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Geçersiz şifre' });
    }

    // Şifreyi çıkar ve diğer bilgileri gönder
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  } finally {
    if (connection) connection.release();
  }
});

// Oturum kontrolü endpoint'i
router.get('/check-session/:userId', async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    connection = await db.getConnection();

    const [users] = await connection.execute(
      'SELECT id, firstName, lastName, email, profileImage FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Geçersiz oturum' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Oturum kontrolü hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router; 