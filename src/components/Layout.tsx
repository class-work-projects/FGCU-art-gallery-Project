import { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-7xl w-full mx-auto">{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        <Link to="/" className="text-lg font-semibold tracking-tight">FGCU Art Gallery</Link>
        <nav className="flex gap-6 text-sm font-medium">
          <Nav activeClassName="text-brand-600" to="/" label="Gallery" />
          <Nav activeClassName="text-brand-600" to="/audio" label="Audio" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function Nav({ to, label, activeClassName }: { to: string; label: string; activeClassName?: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'transition-colors hover:text-brand-600 ' + (isActive ? activeClassName || 'text-brand-600' : 'text-neutral-500')
      }
      end
    >
      {label}
    </NavLink>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8 text-sm text-neutral-500">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} FGCU Dataverse Gallery.</p>
        <p>
          Powered by{' '}
          <a className="underline hover:text-brand-600" href="https://dataverse.org" target="_blank" rel="noreferrer">
            Dataverse
          </a>
        </p>
      </div>
    </footer>
  );
}
