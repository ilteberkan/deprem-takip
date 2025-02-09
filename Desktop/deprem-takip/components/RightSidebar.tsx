import Clock from './Clock';

export default function RightSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="p-4">
        <Clock />
      </div>
    </aside>
  );
}
