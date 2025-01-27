const express = require('express');
const http = require('http');  // HTTP için
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();

// SSL sertifika ayarları
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'private.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.crt'))
};

// Uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS ayarları - tüm portları ekleyelim
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://localhost:8080',
    'http://localhost:8443',
    'https://localhost:8443'
  ],
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Debug middleware - CORS hatalarını görmek için
app.use((req, res, next) => {
  console.log('İstek geldi:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    headers: req.headers
  });
  next();
});

app.use(express.json());

// Options isteklerini karşıla
app.options('*', cors());

// Statik dosyaları sunmak için
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Server çalışıyor' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// Her iki portta da dinle (HTTP ve HTTPS)
const HTTP_PORT = 3000;
const HTTPS_PORT = 3001;

// HTTP server
const httpServer = http.createServer(app);
httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP Server http://localhost:${HTTP_PORT} adresinde çalışıyor`);
});

// HTTPS server
const httpsServer = https.createServer(sslOptions, app);
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server https://localhost:${HTTPS_PORT} adresinde çalışıyor`);
});

// Socket.IO ayarları
const io = require('socket.io')(httpsServer, {
  cors: {
    origin: ['https://localhost:8443', 'http://localhost:8080'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Online kullanıcıları ve eşleşmeleri tutacak Map'ler
const onlineUsers = new Map(); // socketId -> userId
const waitingUsers = new Set(); // eşleşme bekleyen socketId'ler
const activeMatches = new Map(); // socketId -> matchedSocketId

// Socket.IO olayları
io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log('Yeni bağlantı:', socket.id, 'Kullanıcı:', userId);

  // Kullanıcı online olduğunda
  onlineUsers.set(socket.id, userId);

  // Eşleşme isteği
  socket.on('startMatching', () => {
    console.log('Eşleşme isteği:', socket.id);
    
    // Zaten eşleşmiş kullanıcıyı kontrol et
    if (activeMatches.has(socket.id)) {
      return;
    }

    // Kendisiyle eşleşmeyi önle
    const availableUsers = Array.from(waitingUsers).filter(id => id !== socket.id);
    
    if (availableUsers.length > 0) {
      // Eşleşecek kullanıcıyı bul
      const partnerId = availableUsers[0];
      waitingUsers.delete(partnerId);
      
      // Eşleşmeleri kaydet
      activeMatches.set(socket.id, partnerId);
      activeMatches.set(partnerId, socket.id);

      // Her iki kullanıcıya da bildir
      io.to(socket.id).emit('matched', { partnerId });
      io.to(partnerId).emit('matched', { partnerId: socket.id });

      console.log('Eşleşme gerçekleşti:', socket.id, partnerId);
    } else {
      // Eşleşme bekleyenler listesine ekle
      waitingUsers.add(socket.id);
      console.log('Eşleşme bekleniyor:', socket.id);
    }
  });

  // Eşleşmeyi durdur
  socket.on('stopMatching', () => {
    console.log('Eşleşme durduruldu:', socket.id);
    waitingUsers.delete(socket.id);
    const matchedUser = activeMatches.get(socket.id);
    if (matchedUser) {
      activeMatches.delete(matchedUser);
      activeMatches.delete(socket.id);
      io.to(matchedUser).emit('matchEnded');
      socket.emit('matchEnded');
    }
  });

  // Chat mesajı
  socket.on('chatMessage', (messageData) => {
    console.log('Chat mesajı:', socket.id, messageData);
    const matchedUser = activeMatches.get(socket.id);
    if (matchedUser) {
      io.to(matchedUser).emit('chatMessage', {
        text: messageData.text,
        senderName: messageData.senderName,
        senderImage: messageData.senderImage
      });
    }
  });

  // Bağlantı koptuğunda
  socket.on('disconnect', () => {
    console.log('Bağlantı koptu:', socket.id);
    const matchedUser = activeMatches.get(socket.id);
    if (matchedUser) {
      activeMatches.delete(matchedUser);
      activeMatches.delete(socket.id);
      io.to(matchedUser).emit('matchEnded');
    }
    waitingUsers.delete(socket.id);
    onlineUsers.delete(socket.id);
  });
});

// Eşleşme fonksiyonu
function tryMatch() {
  const waitingArray = Array.from(waitingUsers);
  if (waitingArray.length >= 2) {
    const user1 = waitingArray[0];
    const user2 = waitingArray[1];

    // Eşleşen kullanıcıları bekleme listesinden çıkar
    waitingUsers.delete(user1);
    waitingUsers.delete(user2);

    // Eşleşmeleri kaydet
    activeMatches.set(user1, user2);
    activeMatches.set(user2, user1);

    // Kullanıcılara eşleşme bilgisini gönder
    io.to(user1).emit('matched', { partnerId: user2 });
    io.to(user2).emit('matched', { partnerId: user1 });

    console.log('Eşleşme gerçekleşti:', user1, user2);
  }
} 