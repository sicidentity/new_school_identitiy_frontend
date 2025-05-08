import AuthPanelLayout from '@/components/UserPanel';
import PanelLayout from '@/components/PanelLayout';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <main className="flex h-screen w-[100vw] font-inter">
      <AuthPanelLayout>
        <PanelLayout>
          {children}
        </PanelLayout>
      </AuthPanelLayout>
    </main>
  );
}