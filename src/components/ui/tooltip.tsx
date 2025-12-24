'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { cn } from '@/lib/utils';

type TooltipContextValue = { isTouch: boolean };
const TooltipContext = React.createContext<TooltipContextValue>({ isTouch: false });

const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia('(hover: none)');
    const onChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    setIsTouch(mql.matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isTouch;
};

function TooltipProvider({ delayDuration = 0, children, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  const isTouch = useIsTouchDevice();
  return (
    <TooltipContext.Provider value={{ isTouch }}>
      <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props}>
        {children}
      </TooltipPrimitive.Provider>
    </TooltipContext.Provider>
  );
}

function Tooltip({
  children,
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root> & { children: React.ReactNode }) {
  const isTouch = useIsTouchDevice();

  // Use popover behavior on touch devices to allow tap-to-open, keep tooltip hover on desktop
  if (isTouch) {
    return (
      <TooltipContext.Provider value={{ isTouch }}>
        <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={0}>
          <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
            {children}
          </Popover>
        </TooltipPrimitive.Provider>
      </TooltipContext.Provider>
    );
  }

  return (
    <TooltipContext.Provider value={{ isTouch }}>
      <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={0}>
        <TooltipPrimitive.Root data-slot="tooltip" open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} {...props}>
          {children}
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    </TooltipContext.Provider>
  );
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const { isTouch } = React.useContext(TooltipContext);
  if (isTouch) {
    return <PopoverTrigger data-slot="tooltip-trigger" {...props} />;
  }
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & React.ComponentProps<typeof PopoverContent>) {
  const { isTouch } = React.useContext(TooltipContext);

  const contentClasses = cn(
    'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
    className,
  );

  if (isTouch) {
    return (
      <PopoverContent data-slot="tooltip-content" sideOffset={sideOffset} className={contentClasses} {...props}>
        {children}
      </PopoverContent>
    );
  }

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content data-slot="tooltip-content" sideOffset={sideOffset} className={contentClasses} {...props}>
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
