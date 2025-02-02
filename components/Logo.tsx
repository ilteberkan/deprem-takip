const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="relative">
      <svg 
        className="w-12 h-12 text-red-600" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M12 4.29L16.89 9.17L15.47 10.59L12 7.12L8.53 10.59L7.11 9.17L12 4.29M12 19.71L7.11 14.83L8.53 13.41L12 16.88L15.47 13.41L16.89 14.83L12 19.71M12 14.12L8.53 10.65L12 7.18L15.47 10.65L12 14.12Z"/>
      </svg>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"/>
    </div>
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Son Depremler</h1>
      <p className="text-sm text-gray-500">Kandilli Rasathanesi Verileri</p>
    </div>
  </div>
);

export default Logo; 