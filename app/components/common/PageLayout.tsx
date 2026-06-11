type PageLayoutProps = {
  children: React.ReactNode;
};

export default function PageLayout({
  children,
}: PageLayoutProps) {
  return (
    <main className="min-h-screen bg-white">
      
      {/* 실제 컨텐츠 영역 */}
      <div
        className="
          mx-auto
          w-full
          max-w-[430px]
          px-[28px]
          pb-24
        "
      >
        {children}
      </div>

    </main>
  );
}