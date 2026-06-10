type MainButtonProps = {
  children: React.ReactNode;

  onClick?: () => void;

  disabled?: boolean;

  className?: string;
};

export default function MainButton({
  children,
  onClick,
  disabled = false,
  className = "",
}: MainButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-[12px]
        bg-[#1C70D7]

        body-15-bold
        text-[#FFFFFF]

        transition
        active:scale-[0.98]

        disabled:bg-gray-300

        ${className}
      `}
    >
      {children}
    </button>
  );
}