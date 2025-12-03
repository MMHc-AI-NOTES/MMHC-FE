import HeaderLeft from './HeaderLeft';
// import ThemeToggle from './ThemeToggle';
import NotificationButton from './NotificationButton';
import UserDropdown from './UserDropdown';
import GlobalSearch from './GlobalSearch';

const Header = () => {
  return (
    <header>
      <div className="flex h-16 items-center justify-between bg-white px-5">
        <HeaderLeft />

        <div className="flex items-center gap-2">
          {/* <ThemeToggle /> */}
          <GlobalSearch />
          <NotificationButton />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
