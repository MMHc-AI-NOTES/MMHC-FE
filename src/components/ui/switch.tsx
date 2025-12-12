import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer data-[state=checked]:bg-primary-light focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.5rem] w-10 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-gray-300',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground data-[state=unchecked]:translate-x-2px pointer-events-none block size-5 rounded-full bg-white ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)]',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
