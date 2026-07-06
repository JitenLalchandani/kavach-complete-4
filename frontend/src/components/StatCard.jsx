const StatCard = ({ label, value, icon: Icon, tone = 'teal' }) => {
  const toneMap = {
    teal: 'text-teal-700 bg-teal-50',
    marigold: 'text-marigold-700 bg-marigold-50',
    alert: 'text-alert-dark bg-alert-light',
    safe: 'text-safe bg-safe-light',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${toneMap[tone]}`}>
        {Icon && <Icon className="w-7 h-7" />}
      </div>
      <div>
        <p className="text-3xl font-display font-extrabold text-ink leading-none">{value}</p>
        <p className="text-ink/60 text-sm mt-1">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
