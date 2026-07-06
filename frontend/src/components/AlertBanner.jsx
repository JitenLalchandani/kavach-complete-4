import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

const STYLES = {
  info: { bg: 'bg-teal-50', text: 'text-teal-700', Icon: Info },
  success: { bg: 'bg-safe-light', text: 'text-safe', Icon: CheckCircle2 },
  warning: { bg: 'bg-marigold-50', text: 'text-marigold-700', Icon: AlertTriangle },
  danger: { bg: 'bg-alert-light', text: 'text-alert-dark', Icon: XCircle },
};

const AlertBanner = ({ type = 'info', children, className = '' }) => {
  const { bg, text, Icon } = STYLES[type] || STYLES.info;
  return (
    <div className={`flex items-start gap-3 rounded-2xl p-4 ${bg} ${text} ${className}`} role="status">
      <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
      <div className="font-medium">{children}</div>
    </div>
  );
};

export default AlertBanner;
