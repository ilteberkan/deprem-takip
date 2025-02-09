import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useCallback } from 'react';
import type { FC, KeyboardEvent } from 'react';

interface NavItem {
  href: string;
  label: string;
}

interface NavbarProps {
  className?: string;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Son Depremler' },
  { href: '/major-earthquakes', label: 'Büyük Depremler' },
  { href: '/local-earthquakes', label: 'Bölgenizdeki Depremler' },
];

export const Navbar: FC<NavbarProps> = ({ className = '' }) => {
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen((prev: boolean) => !prev);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleMenuToggle();
    }
  }, [handleMenuToggle]);

  return (
    <nav
      className={`${className} ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      } shadow-md transition-colors duration-200`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleMenuToggle}
            onKeyDown={handleKeyDown}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            tabIndex={0}
          >
            <span className="sr-only">Menü</span>
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex md:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white focus:ring-gray-500'
                    : 'text-gray-700 hover:text-gray-900 focus:ring-gray-500'
                }`}
                tabIndex={0}
                role="menuitem"
                aria-label={item.label}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`${
          isMenuOpen ? 'block' : 'hidden'
        } md:hidden transition-all duration-200 ease-in-out`}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="mobile-menu-button"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              tabIndex={0}
              role="menuitem"
              aria-label={item.label}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
