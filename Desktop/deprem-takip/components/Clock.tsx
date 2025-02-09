import React, { useEffect, useState } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // SSR uyumluluğu için tarayıcı kontrolü
    if (typeof window !== 'undefined') {
      const updateTime = () => {
        const now = new Date();
        setTime(now.toLocaleTimeString('tr-TR'));
      };
      
      // İlk zamanı hemen ayarla
      updateTime();
      
      timer = setInterval(updateTime, 1000);
    }
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-lg font-medium text-gray-900 dark:text-white">
      {time}
    </div>
  );
};

export default Clock;
