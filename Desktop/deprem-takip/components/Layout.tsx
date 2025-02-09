import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6">
        <div className="container mx-auto max-w-7xl relative">
          {children}
        </div>
      </main>
      <RightSidebar />
    </div>
  );
}
