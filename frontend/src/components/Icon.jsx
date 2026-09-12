const paths = {
  user: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </>
  ),
  users: (
    <>
      <circle cx="8.7" cy="8.3" r="3" />
      <path d="M3 19c0-3 2.5-5.1 5.7-5.1s5.7 2.1 5.7 5.1" />
      <circle cx="16.8" cy="9" r="2.4" />
      <path d="M15.3 13.4c2.5.4 4.2 2.3 4.2 5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </>
  ),
  calendarPlus: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
      <line x1="12" y1="12.5" x2="12" y2="17" />
      <line x1="9.7" y1="14.75" x2="14.3" y2="14.75" />
    </>
  ),
  check: <polyline points="4,12.5 9,17.5 20,6.5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <polyline points="8,12.3 11,15.3 16.3,9" />
    </>
  ),
  play: <polygon points="8,6 18,12 8,18" />,
  trash: (
    <>
      <path d="M5 7h14" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M7 7l1 12.4A1.5 1.5 0 0 0 9.5 21h5a1.5 1.5 0 0 0 1.5-1.6L17 7" />
      <line x1="10" y1="10.5" x2="10.4" y2="16.5" />
      <line x1="14" y1="10.5" x2="13.6" y2="16.5" />
    </>
  ),
  edit: (
    <>
      <path d="M4 16.6V20h3.4L18.4 9 15 5.6 4 16.6z" />
      <path d="M13.4 7 17 10.6" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  x: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <polyline points="7,10.5 12,15.5 17,10.5" />
      <path d="M4.5 18.5h15" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15V3" />
      <polyline points="7,7.5 12,2.5 17,7.5" />
      <path d="M4.5 18.5h15" />
    </>
  ),
  folder: (
    <path d="M3.5 6.5a1 1 0 0 1 1-1h4.8l1.9 2.1h9a1 1 0 0 1 1 1v9.4a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V6.5z" />
  ),
  fileText: (
    <>
      <path d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1z" />
      <path d="M14 3.5v4h4" />
      <line x1="9" y1="12.6" x2="15" y2="12.6" />
      <line x1="9" y1="16.1" x2="15" y2="16.1" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M4 17.5l5-5 3.5 3.5 2.5-2.5 5 5" />
    </>
  ),
  paperclip: (
    <path d="M18.4 11.4 10 19.8a4 4 0 0 1-5.6-5.6L13 5.6a2.7 2.7 0 0 1 3.8 3.8l-7.9 7.9a1.3 1.3 0 0 1-1.9-1.9l6.9-6.9" />
  ),
  alertTriangle: (
    <>
      <path d="M12 4.5 21 19.5H3z" />
      <line x1="12" y1="10" x2="12" y2="14.3" />
      <line x1="12" y1="16.6" x2="12" y2="16.7" />
    </>
  ),
  messageCircle: <path d="M4 12a8 8 0 1 1 3 6.2L4 20l1.2-3.4A7.9 7.9 0 0 1 4 12z" />,
  history: (
    <>
      <circle cx="12" cy="13" r="7.3" />
      <polyline points="12,9.2 12,13 14.8,14.8" />
      <path d="M6.2 5.4 4.3 3.2" />
    </>
  ),
  refreshCw: (
    <>
      <path d="M20 11a8 8 0 0 0-14.6-4.4" />
      <path d="M4 13a8 8 0 0 0 14.6 4.4" />
      <polyline points="20,4 20,11 13,11" />
      <polyline points="4,20 4,13 11,13" />
    </>
  ),
  barChart: (
    <>
      <line x1="6" y1="19" x2="6" y2="12" />
      <line x1="12" y1="19" x2="12" y2="8" />
      <line x1="18" y1="19" x2="18" y2="14" />
    </>
  ),
  clipboard: (
    <>
      <rect x="6" y="4.5" width="12" height="16" rx="2" />
      <rect x="9" y="3" width="6" height="3" rx="1" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </>
  ),
  arrowLeft: (
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="11,6 5,12 11,18" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <line x1="15.2" y1="15.2" x2="20" y2="20" />
    </>
  ),
};

const Icon = ({ name, size = 17, strokeWidth = 1.8, className = '', style }) => {
  const content = paths[name];
  if (!content) return null;
  return (
    <svg
      className={`icon icon-${name} ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {content}
    </svg>
  );
};

export default Icon;
