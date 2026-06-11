type SubButtonProps = {
  children: React.ReactNode;

  onClick?: () => void;

  disabled?: boolean;

  className?: string;
};

export default function SubButton({
  children,
  onClick,
  disabled = false,
  className = "",
}: SubButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        h-[54px]

        rounded-[8px]
        bg-[#F5F7FA]

        body-15-bold
        text-[#666666]

        transition
        active:scale-[0.98]

        disabled:bg-gray-200

        ${className}
      `}
    >
      {children}
    </button>
  );
}