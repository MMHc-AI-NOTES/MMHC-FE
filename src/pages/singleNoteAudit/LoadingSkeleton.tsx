import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NoteInformationSkeleton = () => (
  <Card>
    <CardContent className="py-4">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
        <Skeleton className="h-9 w-24 justify-self-start" />
      </div>
    </CardContent>
  </Card>
);

const SessionFieldCardSkeleton = ({ tall = false }: { tall?: boolean }) => (
  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
    <div className="flex items-center justify-between bg-[#F7F8F7] px-4 py-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="space-y-2 border-gray-200 px-4 py-4 md:border-r">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="space-y-2 border-t border-gray-200 px-4 py-4 md:border-t-0">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
      </div>
    </div>
    {tall && (
      <div className="border-t border-gray-200 px-4 py-4">
        <Skeleton className="mb-3 h-3 w-28" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    )}
  </div>
);

const TherapySessionSummarySkeleton = () => (
  <Card className="gap-1">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-36" />
      </CardTitle>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-56" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-10 w-72 rounded-md" />
      <div className="space-y-4">
        <SessionFieldCardSkeleton />
        <SessionFieldCardSkeleton tall />
        <SessionFieldCardSkeleton />
        <SessionFieldCardSkeleton tall />
      </div>
      <div className="flex items-center justify-between border-t pt-3">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const DiagnosisCardSkeleton = () => (
  <Card className="gap-1">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-24" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-24 w-full rounded-lg" />
    </CardContent>
  </Card>
);

const GenericCardSkeleton = ({ height = 'h-40' }: { height?: string }) => (
  <Card className="gap-1">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton className={`w-full rounded-lg ${height}`} />
    </CardContent>
  </Card>
);

const LoadingSkeleton = ({ backPath }: { backPath: string }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Button onClick={() => navigate(backPath)} className="mb-2 w-fit">
        <ArrowLeft />
      </Button>

      <NoteInformationSkeleton />

      <TherapySessionSummarySkeleton />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="space-y-4">
          <DiagnosisCardSkeleton />
        </div>
        <div className="space-y-4">
          <GenericCardSkeleton height="h-44" />
          <GenericCardSkeleton height="h-32" />
          <GenericCardSkeleton height="h-48" />
          <GenericCardSkeleton height="h-56" />
          <GenericCardSkeleton height="h-40" />
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
