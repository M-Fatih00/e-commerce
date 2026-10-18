import "./Loader.css";

type LoaderProps = {
  fullScreen?: boolean;
  minHeight?: number;
  label?: string;
};

export default function Loader({ fullScreen = false, minHeight = 240, label = "Yükleniyor" }: LoaderProps) {
  return (
    <div
      className={`app-loader${fullScreen ? " app-loader-full" : ""}`}
      style={fullScreen ? undefined : { minHeight }}
      role="status"
      aria-live="polite"
    >
      <svg className="app-loader-mark" viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
        <path
          className="app-loader-handle"
          d="M24 25v-7a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v7"
          fill="none"
          stroke="#1367ef"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        <g className="app-loader-bag">
          <path d="M15 22h34l3.2 32a4 4 0 0 1-4 4.4H15.8a4 4 0 0 1-4-4.4z" fill="#111111" />
          <circle cx="24" cy="27" r="1.9" fill="#ffffff" />
          <circle cx="40" cy="27" r="1.9" fill="#ffffff" />
          <rect x="25.5" y="33" width="4.6" height="17" fill="#ffffff" />
          <rect x="25.5" y="33" width="13" height="4.4" fill="#ffffff" />
          <rect x="25.5" y="39.3" width="10.5" height="4.4" fill="#ffffff" />
          <rect x="25.5" y="45.6" width="13" height="4.4" fill="#ffffff" />
        </g>
      </svg>
      <span className="app-loader-label">{label}</span>
    </div>
  );
}