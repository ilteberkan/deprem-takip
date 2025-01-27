// API URL - HTTP veya HTTPS
const API_URL = window.location.protocol === 'https:' 
  ? 'https://localhost:3001'
  : 'http://localhost:3000';

// Global userData değişkeni
let userData = null;

// Tab değiştirme fonksiyonu
function switchTab(tabName) {
  // Tab butonlarını güncelle
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Formları göster/gizle
  document.getElementById('login-form').classList.toggle('hidden', tabName !== 'login');
  document.getElementById('signup-form').classList.toggle('hidden', tabName !== 'register');
}

// Medya akışını başlat
async function initializeMedia() {
  try {
    // Önce sadece video ile deneyelim
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
      },
      audio: false
    }).catch(async (err) => {
      console.log('Video hatası:', err);
      // Video başarısız olursa sadece ses deneyelim
      return await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
      });
    });

    // Stream kontrolü
    if (!stream) {
      throw new Error('Medya akışı alınamadı');
    }

    // Video elementini bul ve stream'i bağla
    const localVideo = document.getElementById('localVideo');
    if (localVideo) {
      localVideo.srcObject = stream;
      localVideo.onloadedmetadata = () => {
        console.log('Video yüklendi, oynatılıyor...');
        localVideo.play().catch(e => console.error('Video oynatma hatası:', e));
      };
    }

    // Medya izinlerini kontrol et
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    // Butonları güncelle
    updateMediaButtons(videoTrack, audioTrack);
    
    return stream;
  } catch (error) {
    console.error('Medya erişim hatası:', error);
    
    // Kullanıcıya daha detaylı bilgi ver
    let errorMessage = 'Kamera ve mikrofon erişimi için izin gerekli!';
    if (error.name === 'NotFoundError') {
      errorMessage = 'Kamera veya mikrofon bulunamadı. Lütfen cihazlarınızı kontrol edin.';
    } else if (error.name === 'NotAllowedError') {
      errorMessage = 'Kamera ve mikrofon izni reddedildi. Lütfen izin verin.';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Kamera veya mikrofon başka bir uygulama tarafından kullanılıyor.';
    }
    
    alert(errorMessage);
    return null;
  }
}

// Medya butonlarını güncelle
function updateMediaButtons(videoTrack, audioTrack) {
  const toggleVideoBtn = document.getElementById('toggleVideo');
  const toggleAudioBtn = document.getElementById('toggleAudio');

  if (toggleVideoBtn && videoTrack) {
    toggleVideoBtn.textContent = videoTrack.enabled ? 'Video Kapat' : 'Video Aç';
    toggleVideoBtn.disabled = false;
  } else if (toggleVideoBtn) {
    toggleVideoBtn.textContent = 'Video Yok';
    toggleVideoBtn.disabled = true;
  }

  if (toggleAudioBtn && audioTrack) {
    toggleAudioBtn.textContent = audioTrack.enabled ? 'Ses Kapat' : 'Ses Aç';
    toggleAudioBtn.disabled = false;
  } else if (toggleAudioBtn) {
    toggleAudioBtn.textContent = 'Ses Yok';
    toggleAudioBtn.disabled = true;
  }
}

// Socket.IO bağlantısı
let socket = null;

// Socket.IO bağlantısını başlat
function initializeSocket(userId) {
  socket = io(API_URL, {
    auth: { userId }
  });

  socket.on('connect', () => {
    console.log('Socket.IO bağlandı');
    // Eşleşme durumunu sıfırla
    document.getElementById('startMatch').disabled = false;
    document.getElementById('stopMatch').disabled = true;
    document.getElementById('messages').innerHTML = '';
  });

  socket.on('matched', ({ partnerId }) => {
    console.log('Eşleşme bulundu:', partnerId);
    document.getElementById('startMatch').disabled = true;
    document.getElementById('stopMatch').disabled = false;
    alert('Eşleşme bulundu! Sohbet başlatılıyor...');
  });

  socket.on('matchEnded', () => {
    console.log('Eşleşme sona erdi');
    document.getElementById('startMatch').disabled = false;
    document.getElementById('stopMatch').disabled = true;
    document.getElementById('messages').innerHTML = '';
    alert('Eşleşme sona erdi.');
  });

  socket.on('chatMessage', (message) => {
    console.log('Gelen mesaj:', message); // Debug için
    addMessageToChat(
      message.text,
      false,
      message.senderName || 'Eşleşilen Kişi',
      message.senderImage || null
    );
  });

  // Chat form olaylarını dinle
  const chatForm = document.getElementById('chat-form');
  const messageInput = document.getElementById('message-input');

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
      const messageData = {
        text: message,
        senderName: `${userData.firstName} ${userData.lastName}`,
        senderImage: userData.profileImage || null
      };

      socket.emit('chatMessage', messageData);
      addMessageToChat(
        message,
        true,
        `${userData.firstName} ${userData.lastName}`,
        userData.profileImage
      );
      messageInput.value = '';
    }
  });

  // Eşleşme butonları
  const startMatchBtn = document.getElementById('startMatch');
  const stopMatchBtn = document.getElementById('stopMatch');

  startMatchBtn.addEventListener('click', () => {
    socket.emit('startMatching');
    startMatchBtn.disabled = true;
    stopMatchBtn.disabled = false;
  });

  stopMatchBtn.addEventListener('click', () => {
    socket.emit('stopMatching');
    startMatchBtn.disabled = false;
    stopMatchBtn.disabled = true;
  });
}

// Mesajı sohbet alanına ekle
function addMessageToChat(message, isSent, senderName = '', senderImage = '') {
  const messagesDiv = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
  
  // Profil resmi ve isim içeren header
  const messageHeader = document.createElement('div');
  messageHeader.className = 'message-header';
  
  if (senderImage) {
    const img = document.createElement('img');
    img.src = senderImage;
    img.className = 'message-avatar';
    img.alt = senderName;
    messageHeader.appendChild(img);
  }
  
  const nameSpan = document.createElement('span');
  nameSpan.className = 'message-sender';
  nameSpan.textContent = senderName || (isSent ? 'Sen' : 'Eşleşilen Kişi');
  messageHeader.appendChild(nameSpan);
  
  // Mesaj içeriği
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = message;
  
  messageElement.appendChild(messageHeader);
  messageElement.appendChild(messageContent);
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Sayfa yüklendiğinde oturum kontrolü
async function checkSession() {
  const userId = localStorage.getItem('userId');
  const userDataStr = localStorage.getItem('userData');
  
  if (userId && userDataStr) {
    try {
      // localStorage'dan userData'yı al
      userData = JSON.parse(userDataStr);
      
      // Ana ekranı göster
      document.getElementById('auth-container').classList.add('hidden');
      document.getElementById('video-chat').classList.remove('hidden');
      
      // Medya ve socket bağlantılarını başlat
      await initializeMedia();
      initializeSocket(userId);
      
      return true;
    } catch (error) {
      console.error('Oturum kontrolü hatası:', error);
      // Hata durumunda bile oturumu devam ettir
      return true;
    }
  }
  return false;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Önce oturum kontrolü yap
  const isLoggedIn = await checkSession();
  
  // Eğer oturum yoksa normal login/register işlemlerine devam et
  if (!isLoggedIn) {
    // Tab butonlarını aktifleştir
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Login formunu göster
    document.getElementById('auth-container').classList.remove('hidden');
  }

  // Login form işlemleri
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      email: document.getElementById('login-email').value.trim(),
      password: document.getElementById('login-password').value
    };

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Kullanıcı verilerini sakla
        userData = {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          profileImage: data.profileImage
        };
        
        // userData'yı localStorage'a kaydet
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('userId', data.id);
        
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('video-chat').classList.remove('hidden');
        await initializeMedia();
        initializeSocket(data.id);
      } else {
        alert('Giriş başarısız: ' + data.error);
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      alert('Giriş yapılamadı. Lütfen daha sonra tekrar deneyin.');
    }
  });

  // Kayıt formu işlemleri
  const signupForm = document.getElementById('signup-form');
  const passwordInput = document.getElementById('password');
  const passwordError = document.getElementById('password-error');

  // Şifre kontrolü
  function validatePassword(password) {
    if (password.length < 10) {
      return 'Şifre en az 10 karakter olmalıdır';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Şifre en az bir büyük harf içermelidir';
    }
    if (!/[0-9]/.test(password)) {
      return 'Şifre en az bir rakam içermelidir';
    }
    return null;
  }

  // Şifre alanı değiştiğinde kontrol et
  passwordInput.addEventListener('input', (e) => {
    const error = validatePassword(e.target.value);
    if (error) {
      passwordError.textContent = error;
      passwordError.classList.remove('hidden');
    } else {
      passwordError.textContent = '';
      passwordError.classList.add('hidden');
    }
  });

  // Kayıt formu gönderildiğinde
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Kayıt formu gönderiliyor...');

    const formData = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: passwordInput.value,
      age: parseInt(document.getElementById('age').value)
    };

    // Form verilerini kontrol et
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.age) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    // Şifre kontrolü
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      alert(passwordError);
      return;
    }

    try {
      console.log('Sunucuya kayıt isteği gönderiliyor...');
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Sunucu yanıtı:', data);

      if (response.ok) {
        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        // Giriş tabına geç
        switchTab('login');
        // Form alanlarını temizle
        signupForm.reset();
      } else {
        alert('Kayıt başarısız: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      alert('Kayıt yapılamadı. Lütfen daha sonra tekrar deneyin.');
    }
  });

  // Video/Ses kontrol butonlarının başlangıç durumu
  const toggleVideoBtn = document.getElementById('toggleVideo');
  const toggleAudioBtn = document.getElementById('toggleAudio');
  
  if (toggleVideoBtn) toggleVideoBtn.textContent = 'Video Kapat';
  if (toggleAudioBtn) toggleAudioBtn.textContent = 'Ses Kapat';

  // Profil butonu event listener'ı
  document.getElementById('profileBtn').addEventListener('click', async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Lütfen önce giriş yapın');
      return;
    }

    try {
      // Profil bilgilerini sunucudan al ve güncelle
      const response = await fetch(`${API_URL}/profile/${userId}`);
      const data = await response.json();

      if (response.ok) {
        // userData'yı güncelle
        userData = {
          ...userData,
          ...data.profile
        };
        // localStorage'ı güncelle
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Profil bilgilerini doldur
        document.getElementById('profileFullName').textContent = 
          `${data.profile.firstName} ${data.profile.lastName}`;
        document.getElementById('profileAge').textContent = data.profile.age;
        document.getElementById('profileCountry').textContent = data.profile.country || 'Belirtilmemiş';
        document.getElementById('profileBio').textContent = data.profile.bio || '';
        document.getElementById('profileWebsite').textContent = data.profile.website || '';
        
        // Profil resmini güncelle
        if (data.profile.profileImage) {
          document.getElementById('profileImage').src = data.profile.profileImage;
        }

        // Blog yazılarını listele
        const blogPosts = document.getElementById('blogPosts');
        blogPosts.innerHTML = data.posts.map(post => `
          <div class="blog-post">
            <h4>${post.title}</h4>
            <div class="meta">${new Date(post.createdAt).toLocaleDateString()}</div>
            <p>${post.content}</p>
          </div>
        `).join('');

        // Video chat'i gizle ve profil sayfasını göster
        document.getElementById('video-chat').classList.add('hidden');
        document.getElementById('profile-page').classList.remove('hidden');
      } else {
        throw new Error(data.error || 'Profil bilgileri alınamadı');
      }
    } catch (error) {
      console.error('Profil yükleme hatası:', error);
      // Hata durumunda mevcut bilgileri göster
      document.getElementById('profileFullName').textContent = 
        `${userData.firstName} ${userData.lastName}`;
      document.getElementById('profileAge').textContent = userData.age || '';
      document.getElementById('profileCountry').textContent = userData.country || 'Belirtilmemiş';
      document.getElementById('profileBio').textContent = userData.bio || '';
      document.getElementById('profileWebsite').textContent = userData.website || '';
      
      if (userData.profileImage) {
        document.getElementById('profileImage').src = userData.profileImage;
      }
    }
    
    // Her durumda profil sayfasını göster
    document.getElementById('video-chat').classList.add('hidden');
    document.getElementById('profile-page').classList.remove('hidden');
  });

  // Çıkış butonu event listener'ı
  document.getElementById('logoutBtn').addEventListener('click', () => {
    // Socket.IO bağlantısını kapat
    if (socket) {
      socket.disconnect();
    }

    // Medya akışını kapat
    const localVideo = document.getElementById('localVideo');
    if (localVideo && localVideo.srcObject) {
      localVideo.srcObject.getTracks().forEach(track => track.stop());
      localVideo.srcObject = null;
    }

    // LocalStorage'ı temizle
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');

    // Sayfaları sıfırla
    document.getElementById('video-chat').classList.add('hidden');
    document.getElementById('profile-page').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
    
    // Form alanlarını temizle
    document.getElementById('login-form').reset();
    document.getElementById('signup-form').reset();
    
    // Login tabına geç
    switchTab('login');

    alert('Çıkış yapıldı');

    // Kullanıcı verilerini temizle
    userData = null;
  });

  // Blog formu gönderildiğinde
  document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');

    const formData = {
      title: document.getElementById('blogTitle').value.trim(),
      content: document.getElementById('blogContent').value.trim()
    };

    try {
      const response = await fetch(`${API_URL}/profile/${userId}/blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Blog yazısı başarıyla eklendi');
        document.getElementById('blogForm').reset();
        // Sayfayı yenile
        document.getElementById('profileBtn').click();
      }
    } catch (error) {
      console.error('Blog ekleme hatası:', error);
      alert('Blog yazısı eklenemedi');
    }
  });

  // Sohbete dön butonu
  document.getElementById('backToChat').addEventListener('click', () => {
    document.getElementById('profile-page').classList.add('hidden');
    document.getElementById('video-chat').classList.remove('hidden');
  });

  // Profil düzenleme butonuna tıklandığında
  document.getElementById('editProfileBtn').addEventListener('click', () => {
    document.getElementById('profileView').classList.add('hidden');
    document.getElementById('profileEditForm').classList.remove('hidden');
    document.getElementById('imageUploadForm').classList.remove('hidden');
    
    // Form alanlarını mevcut değerlerle doldur
    const fullName = document.getElementById('profileFullName').textContent.split(' ');
    document.getElementById('editFirstName').value = fullName[0];
    document.getElementById('editLastName').value = fullName[1];
    document.getElementById('editAge').value = document.getElementById('profileAge').textContent;
    document.getElementById('editCountry').value = document.getElementById('profileCountry').textContent;
    document.getElementById('editBio').value = document.getElementById('profileBio').textContent;
    document.getElementById('editWebsite').value = document.getElementById('profileWebsite').textContent;
  });

  // Profil düzenleme formunu gönder
  document.getElementById('profileEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');

    const formData = {
      firstName: document.getElementById('editFirstName').value.trim(),
      lastName: document.getElementById('editLastName').value.trim(),
      age: parseInt(document.getElementById('editAge').value),
      country: document.getElementById('editCountry').value.trim(),
      bio: document.getElementById('editBio').value.trim(),
      website: document.getElementById('editWebsite').value.trim(),
      socialMedia: {
        instagram: document.getElementById('editInstagram').value.trim(),
        twitter: document.getElementById('editTwitter').value.trim()
      }
    };

    try {
      const response = await fetch(`${API_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Profil güncellendi');
        // Profil sayfasını yenile
        document.getElementById('profileBtn').click();
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      alert('Profil güncellenemedi');
    }
  });

  // Profil resmi yükleme
  document.getElementById('imageUploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    const fileInput = document.getElementById('imageInput');
    
    if (!fileInput.files[0]) {
      alert('Lütfen bir resim seçin');
      return;
    }

    const formData = new FormData();
    formData.append('image', fileInput.files[0]);

    try {
      const response = await fetch(`${API_URL}/profile/${userId}/image`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Profil resmini güncelle
        document.getElementById('profileImage').src = data.imagePath;
        // userData'yı güncelle
        userData = {
          ...userData,
          profileImage: data.relativePath // Göreceli yolu sakla
        };
        // localStorage'ı güncelle
        localStorage.setItem('userData', JSON.stringify(userData));
        alert('Profil resmi güncellendi');
      }
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      alert('Resim yüklenemedi');
    }
  });

  // İptal butonuna tıklandığında
  document.getElementById('cancelEdit').addEventListener('click', () => {
    document.getElementById('profileView').classList.remove('hidden');
    document.getElementById('profileEditForm').classList.add('hidden');
    document.getElementById('imageUploadForm').classList.add('hidden');
  });
}); 