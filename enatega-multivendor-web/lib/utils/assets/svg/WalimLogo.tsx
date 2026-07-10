type WalimLogoProps = {
  className?: string;
};

const WalimLogo = ({ className = "h-10 w-10" }: WalimLogoProps) => {
  return (
    <svg
      className={className}
      viewBox="0 0 1600 1600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Walim"
    >
      <rect x="0" y="0" width="1600" height="1600" rx="320" fill="#FBE1D3" />
      <circle cx="268" cy="446" r="55" fill="#1C2024" />
      <circle cx="1332" cy="446" r="55" fill="#1C2024" />
      <path
        d="M268 558V706C268 960.075 474.925 1167 729 1167H871C1125.07 1167 1332 960.075 1332 706V558"
        stroke="#FF7A22"
        strokeWidth="104"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M479 1166V1214C479 1296.84 546.157 1364 629 1364H971C1053.84 1364 1121 1296.84 1121 1214V1166"
        stroke="#FF7A22"
        strokeWidth="104"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M546 1166H1054"
        stroke="#FF7A22"
        strokeWidth="104"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default WalimLogo;
