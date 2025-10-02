import Image from 'next/image';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="!flex !flex-row !min-h-screen !w-[100vw] !justify-center !font-inter !pt-4">
      <div className="!relative !bg-[#258094] !w-[48vw] !h-[95vh] !rounded-md !z-0 !overflow-hidden">
        <Image
          src="/images/bg-img.png"
          alt="img"
          fill
          className="!object-contain !scale-y-[1.35] !scale-x-[1.3] !translate-y-[-17.5%]"
        />
      </div>
      <div className="!auth-asset">
        {children}
      </div>
    </main>
  );
}
