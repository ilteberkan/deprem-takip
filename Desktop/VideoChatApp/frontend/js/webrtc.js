let localStream;
let peerConnection;
let currentPartner = null;

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

// Medya akışını başlat
async function initializeMedia() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    document.getElementById('localVideo').srcObject = localStream;
    console.log('Medya akışı başlatıldı');
    return true;
  } catch (error) {
    console.error('Medya erişim hatası:', error);
    alert('Kamera ve mikrofon erişimi gerekli!');
    return false;
  }
}

// WebRTC bağlantısını oluştur
function createPeerConnection(partnerId) {
  peerConnection = new RTCPeerConnection(configuration);
  currentPartner = partnerId;

  // Yerel medya akışını ekle
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  // Uzak medya akışını al
  peerConnection.ontrack = (event) => {
    document.getElementById('remoteVideo').srcObject = event.streams[0];
  };

  // ICE adaylarını gönder
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', {
        target: partnerId,
        candidate: event.candidate
      });
    }
  };

  return peerConnection;
}

// Eşleşme başlat
document.getElementById('startMatch').addEventListener('click', async () => {
  if (!localStream) {
    const initialized = await initializeMedia();
    if (!initialized) return;
  }
  socket.emit('startMatching');
  document.getElementById('startMatch').disabled = true;
  document.getElementById('stopMatch').disabled = false;
});

// Eşleşmeyi durdur
document.getElementById('stopMatch').addEventListener('click', () => {
  socket.emit('stopMatching');
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  document.getElementById('remoteVideo').srcObject = null;
  document.getElementById('startMatch').disabled = false;
  document.getElementById('stopMatch').disabled = true;
});

// Video aç/kapat
document.getElementById('toggleVideo').addEventListener('click', () => {
  const videoTrack = localStream.getVideoTracks()[0];
  videoTrack.enabled = !videoTrack.enabled;
});

// Ses aç/kapat
document.getElementById('toggleAudio').addEventListener('click', () => {
  const audioTrack = localStream.getAudioTracks()[0];
  audioTrack.enabled = !audioTrack.enabled;
});

// Socket.IO olayları
socket.on('matched', async ({ partnerId }) => {
  console.log('Eşleşme bulundu:', partnerId);
  
  // WebRTC bağlantısını oluştur
  const pc = createPeerConnection(partnerId);
  
  try {
    // Teklif oluştur ve gönder
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', {
      target: partnerId,
      offer: offer
    });
  } catch (error) {
    console.error('Teklif oluşturma hatası:', error);
  }
});

socket.on('offer', async ({ offer, from }) => {
  console.log('Teklif alındı');
  const pc = createPeerConnection(from);
  
  try {
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('answer', {
      target: from,
      answer: answer
    });
  } catch (error) {
    console.error('Yanıt oluşturma hatası:', error);
  }
});

socket.on('answer', async ({ answer }) => {
  console.log('Yanıt alındı');
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  } catch (error) {
    console.error('Yanıt ayarlama hatası:', error);
  }
});

socket.on('ice-candidate', async ({ candidate }) => {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error('ICE aday ekleme hatası:', error);
  }
}); 