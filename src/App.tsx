import { BrowserRouter } from 'react-router-dom';
import Routes from './routes/routes';
import ProgressAlerts from './components/layout/loader/ProgressAlerts';

const ThemeWrapper = () => {
  return (
    <>
      <Routes />
      <ProgressAlerts />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ThemeWrapper />
    </BrowserRouter>
  );
};

export default App;
