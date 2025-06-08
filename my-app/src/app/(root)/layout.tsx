import PanelLayout from '@/components/UserPanel';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <main className="flex h-screen w-full font-inter">
      <div className="flex size-full flex-col">
        <PanelLayout>
          {children}
        </PanelLayout>
      </div>
    </main>
  );
}