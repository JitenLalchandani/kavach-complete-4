const ShieldLogo = ({ className = 'w-10 h-10', filled = true }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M24 4L8 10.5V22C8 32.6 14.8 40.8 24 44C33.2 40.8 40 32.6 40 22V10.5L24 4Z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path
      d="M17 24L22 29L32 18"
      stroke={filled ? '#F4F7F6' : 'currentColor'}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ShieldLogo;
