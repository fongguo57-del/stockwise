
type StockWiseLogoProps = {
  light?: boolean;
  iconSize?: number;
  textSize?: string;
};

export default function StockWiseLogo({
  light = false,
  iconSize = 44,
  textSize = "text-2xl",
}: StockWiseLogoProps) {
  return (
    <div className="inline-flex items-center gap-3">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="StockWise logo"
        role="img"
      >
        {/* Inventory box */}
        <path
          d="M9 20L32 7L55 20L32 33L9 20Z"
          fill="#DBEAFE"
          stroke="#2563EB"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        <path
          d="M9 20V45L32 58V33L9 20Z"
          fill="#2563EB"
          stroke="#1D4ED8"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        <path
          d="M55 20V45L32 58V33L55 20Z"
          fill="#1E40AF"
          stroke="#1D4ED8"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Box details */}
        <path
          d="M21 27L32 33L43 27"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M32 33V45"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Growth arrow */}
        <path
          d="M39 17L51 5M41 5H51V15"
          stroke="#2563EB"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand name */}
      <span className={`${textSize} font-extrabold tracking-tight`}>
        <span className={light ? "text-white" : "text-blue-950"}>
          Stock
        </span>
        <span className="text-blue-600">
          Wise
        </span>
      </span>
    </div>
  );
}
