import { BrowserRouter } from 'react-router-dom';
import Routes from './routes/routes';
import ProgressAlerts from './components/layout/loader/ProgressAlerts';
import { ErrorBoundary } from './shared/ErrorBoundary';

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
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeWrapper />
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
