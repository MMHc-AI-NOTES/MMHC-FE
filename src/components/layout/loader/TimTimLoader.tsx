import { useAppSelector } from '@/store/store';
import { ThreeDots } from 'react-loader-spinner';

export const TimTimLoader = () => {
  const beatLoader = useAppSelector(state => state.alerts.beatLoader);

  return beatLoader ? (
    <div className="fixed top-13 right-0 left-0 z-50 flex justify-center">
      <ThreeDots height="40" width="40" color="#2563eb" />
    </div>
  ) : null;
};

export default TimTimLoader;
