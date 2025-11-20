const SharedLogo = ({ textPrimary = 'Hey', textSecondary = 'Ed', className = 'text-2xl' }) => {
  return (
    <h2 className={`font-bitter ${className} `}>
      <span className="text-gray-700">{textPrimary}</span>
      <span className="text-primary">{textSecondary}</span>
      <span className="text-primary">.</span>
    </h2>
  );
};

export default SharedLogo;
