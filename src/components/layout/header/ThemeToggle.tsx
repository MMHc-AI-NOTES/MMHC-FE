import { toggleTheme } from '@/store/slices/uiSlice';
import { useAppSelector } from '@/store/store';
import { Moon, Sun } from 'lucide-react';
import { useDispatch } from 'react-redux';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const theme = useAppSelector(state => state.ui.theme);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-md"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeToggle;
