type LogoProps = {
  variant?: "dark" | "light";
  showText?: boolean;
  height?: number;
  className?: string;
};

const BRAND_BLUE = "#1367ef";
const FULL_WIDTH = 272;

export default function Logo({ variant = "dark", showText = true, height = 40, className }: LogoProps) {
  const body = variant === "dark" ? "#111111" : "#ffffff";
  const inner = variant === "dark" ? "#ffffff" : "#111111";
  const text = variant === "dark" ? "#111111" : "#ffffff";
  const sub = variant === "dark" ? "#4b5563" : "#d1d5db";
  const width = showText ? (height * FULL_WIDTH) / 64 : height;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={showText ? `0 0 ${FULL_WIDTH} 64` : "0 0 64 64"}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="E-Commerce Moda ve Giyim"
    >
      <path
        d="M24 25v-7a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v7"
        fill="none"
        stroke={BRAND_BLUE}
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path d="M15 22h34l3.2 32a4 4 0 0 1-4 4.4H15.8a4 4 0 0 1-4-4.4z" fill={body} />
      <circle cx="24" cy="27" r="1.9" fill={inner} />
      <circle cx="40" cy="27" r="1.9" fill={inner} />
      <rect x="25.5" y="33" width="4.6" height="17" fill={inner} />
      <rect x="25.5" y="33" width="13" height="4.4" fill={inner} />
      <rect x="25.5" y="39.3" width="10.5" height="4.4" fill={inner} />
      <rect x="25.5" y="45.6" width="13" height="4.4" fill={inner} />
      {showText && (
        <>
          <text x="66" y="38" fontFamily="inherit" fontSize="24" fontWeight="500" letterSpacing="3" fill={text}>
            E-COMMERCE
          </text>
          <text x="67" y="58" className="logo-tagline" fontFamily="inherit" fontSize="14" fontWeight="500" letterSpacing="2.2" fill={sub}>
            MODA &amp; GİYİM
          </text>
        </>
      )}
    </svg>
  );
}