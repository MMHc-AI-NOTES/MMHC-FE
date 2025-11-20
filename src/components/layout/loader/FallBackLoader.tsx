import { RotatingTriangles } from 'react-loader-spinner';
import { Skeleton } from '../../ui/skeleton';

interface FallBackLoaderProps {
  type?: 'fullPage' | 'page';
}

export const FallBackLoader = ({ type = 'page' }: FallBackLoaderProps) => {
  if (type === 'fullPage') {
    return (
      <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        <RotatingTriangles ariaLabel="rotating-triangles-loading" />
      </div>
    );
  }

  return <Skeleton className="h-full w-full rounded-lg" />;
};
