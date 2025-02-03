import React, { useEffect, useState } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md">
      <h2 className="text-lg font-bold">{time}</h2>
    </div>
  );
};

export default Clock; 