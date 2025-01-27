const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;

// Profil bilgilerini getir
router.get('/:userId', async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    connection = await db.getConnection();

    const [user] = await connection.execute(
      `SELECT id, firstName, lastName, age, country, bio, website, 
              profileImage, socialMedia, createdAt 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Blog yazılarını getir
    const [posts] = await connection.execute(
      'SELECT * FROM blog_posts WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );

    res.json({
      profile: user[0],
      posts
    });
  } catch (error) {
    console.error('Profil hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Blog yazısı ekle
router.post('/:userId/blog', async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Başlık ve içerik gerekli' });
    }

    connection = await db.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO blog_posts (userId, title, content) VALUES (?, ?, ?)',
      [userId, title, content]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      content,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Blog ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Profil güncelleme
router.put('/:userId', async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      age,
      country,
      bio,
      website,
      socialMedia
    } = req.body;

    connection = await db.getConnection();

    const [result] = await connection.execute(
      `UPDATE users 
       SET firstName = ?, lastName = ?, age = ?, 
           country = ?, bio = ?, website = ?, 
           socialMedia = ?
       WHERE id = ?`,
      [
        firstName,
        lastName,
        age,
        country,
        bio,
        website,
        JSON.stringify(socialMedia),
        userId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({ message: 'Profil güncellendi' });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Dosya filtreleme
const fileFilter = (req, file, cb) => {
  // Sadece png ve jpg/jpeg dosyalarına izin ver
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(new Error('Sadece PNG ve JPG formatında resimler yüklenebilir.'), false);
  }
};

// Multer ayarları
const storage = multer.diskStorage({
  destination: 'uploads/profiles/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.params.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Profil resmi yükleme
router.post('/:userId/image', upload.single('image'), async (req, res) => {
  let connection;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Lütfen bir resim seçin' });
    }

    const { userId } = req.params;
    const originalPath = req.file.path;
    const resizedFilename = `resized-${req.file.filename}`;
    const resizedPath = path.join(__dirname, '..', 'uploads', 'profiles', resizedFilename);

    // Uploads/profiles klasörünü oluştur
    const profilesDir = path.join(__dirname, '..', 'uploads', 'profiles');
    if (!fs.existsSync(profilesDir)) {
      await fs.mkdir(profilesDir, { recursive: true });
    }

    // Resmi yeniden boyutlandır
    await sharp(originalPath)
      .resize(100, 100, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(resizedPath);

    // Orijinal dosyayı sil
    await fs.unlink(originalPath);

    // Veritabanında saklanacak yol
    const dbImagePath = `/uploads/profiles/${resizedFilename}`;
    
    connection = await db.getConnection();
    await connection.execute(
      'UPDATE users SET profileImage = ? WHERE id = ?',
      [dbImagePath, userId]
    );

    // Frontend'e tam URL dön
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fullImageUrl = `${baseUrl}${dbImagePath}`;

    res.json({ 
      imagePath: fullImageUrl,
      relativePath: dbImagePath 
    });

  } catch (error) {
    console.error('Profil resmi yükleme hatası:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Dosya boyutu 5MB\'ı geçemez' });
    }
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router; 