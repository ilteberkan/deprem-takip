import { useEffect } from 'react';

export default function Popup() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const isAffected = confirm('Depremden etkilendiniz mi?');
      if (isAffected) {
        // Kullanıcı etkilendiğinde yapılacak işlemler
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return null;
} 