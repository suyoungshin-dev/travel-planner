"use client";

type MenuButtonProps = {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  badgeText?: string;
};

export default function MenuButton({
  icon,
  title,
  onClick,
  badgeText,
}: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        relative flex h-[124px] w-[165px] flex-col
        items-start justify-start
        rounded-[16px] bg-[#F5F7FA]
        px-[32px] py-[32px]
      "
    >
      <div className="text-[#1C70D7]">{icon}</div>

      <div className="mt-[28px] flex items-center">
        <span className="text-[24px] font-bold text-[#111111]">
          {title}
        </span>

        {badgeText && (
          <span className="ml-2 rounded-full bg-[#1C70D7] px-2 py-0.5 text-[13px] font-bold text-white">
            {badgeText}
          </span>
        )}
      </div>
    </button>
  );
}