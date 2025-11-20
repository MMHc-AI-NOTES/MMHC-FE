import HeaderLeft from './HeaderLeft';
import ThemeToggle from './ThemeToggle';
import NotificationButton from './NotificationButton';
import UserDropdown from './UserDropdown';

const Header = () => {
  return (
    <header className="border-primary/20 from-primary/5 to-primary/10 dark:border-primary/30 dark:from-primary/10 dark:to-primary/15 sticky top-0 z-40 w-full border-b bg-gradient-to-r shadow-sm backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-4">
        <HeaderLeft />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationButton />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
