import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { X } from 'lucide-react';
import { setToastObj } from '@/store/slices/alertsSlice';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/store/store';

const SEVERITY_CLASSES = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-yellow-600 text-white',
  info: 'bg-blue-600 text-white',
} as const;

const ToastAlert = () => {
  const dispatch = useDispatch();
  const toastObj = useAppSelector(state => state.alerts.toastObj);

  useEffect(() => {
    if (!toastObj) return;

    const severityClass = SEVERITY_CLASSES[toastObj.severity || 'info'];

    toast.custom(
      t => (
        <div className={`relative min-w-62 rounded-lg px-8 py-4 shadow-lg ${severityClass}`}>
          <button
            onClick={() => toast.dismiss(t)}
            className="absolute top-2 right-2 rounded-full p-1 text-white opacity-80 hover:opacity-100"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>

          <div className="pr-6">
            <strong className="text-base font-semibold">{toastObj.severity?.toUpperCase() || 'INFO'}</strong>
            <p className="mt-1 text-sm">{toastObj.message || 'Oops! Something unexpected happened.'}</p>
          </div>
        </div>
      ),
      {
        duration: toastObj.autoHideDuration ?? 5000,
        position: toastObj.position || 'bottom-right',
      },
    );

    dispatch(setToastObj(null));
  }, [toastObj, dispatch]);

  return <Toaster richColors />;
};

export default ToastAlert;
