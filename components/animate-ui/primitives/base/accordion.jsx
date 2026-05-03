'use client';;
import * as React from 'react';
import { Accordion as AccordionPrimitive } from '@base-ui-components/react/accordion';
import { AnimatePresence, motion } from 'motion/react';

import { getStrictContext } from '@/lib/get-strict-context';
import { useControlledState } from '@/hooks/use-controlled-state';

const [AccordionProvider, useAccordion] =
  getStrictContext('AccordionContext');

const [AccordionItemProvider, useAccordionItem] =
  getStrictContext('AccordionItemContext');

function Accordion(props) {
  const [value, setValue] = useControlledState({
    value: props?.value,
    defaultValue: props?.defaultValue,
    onChange: props?.onValueChange,
  });

  return (
    <AccordionProvider value={{ value, setValue }}>
      <AccordionPrimitive.Root data-slot="accordion" {...props} onValueChange={setValue} />
    </AccordionProvider>
  );
}

function AccordionItem(props) {
  const { value } = useAccordion();
  const [isOpen, setIsOpen] = React.useState(value?.includes(props?.value) ?? false);

  React.useEffect(() => {
    setIsOpen(value?.includes(props?.value) ?? false);
  }, [value, props?.value]);

  return (
    <AccordionItemProvider value={{ isOpen, setIsOpen }}>
      <AccordionPrimitive.Item data-slot="accordion-item" {...props} />
    </AccordionItemProvider>
  );
}

function AccordionHeader(props) {
  return <AccordionPrimitive.Header data-slot="accordion-header" {...props} />;
}

function AccordionTrigger(props) {
  return (<AccordionPrimitive.Trigger data-slot="accordion-trigger" {...props} />);
}

function AccordionPanel({
  transition = { duration: 0.35, ease: 'easeInOut' },
  hiddenUntilFound,
  keepRendered = false,
  ...props
}) {
  const { isOpen } = useAccordionItem();

  return (
    <AnimatePresence>
      {keepRendered ? (
        <AccordionPrimitive.Panel
          hidden={false}
          hiddenUntilFound={hiddenUntilFound}
          keepMounted
          render={
            <motion.div
              key="accordion-panel"
              data-slot="accordion-panel"
              initial={{ height: 0, opacity: 0, '--mask-stop': '0%', y: 20 }}
              animate={
                isOpen
                  ? { height: 'auto', opacity: 1, '--mask-stop': '100%', y: 0 }
                  : { height: 0, opacity: 0, '--mask-stop': '0%', y: 20 }
              }
              transition={transition}
              style={{
                maskImage:
                  'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
                WebkitMaskImage:
                  'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
                overflow: 'hidden',
              }}
              {...props} />
          } />
      ) : (
        isOpen && (
          <AccordionPrimitive.Panel
            hidden={false}
            hiddenUntilFound={hiddenUntilFound}
            keepMounted
            render={
              <motion.div
                key="accordion-panel"
                data-slot="accordion-panel"
                initial={{ height: 0, opacity: 0, '--mask-stop': '0%', y: 20 }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                  '--mask-stop': '100%',
                  y: 0,
                }}
                exit={{ height: 0, opacity: 0, '--mask-stop': '0%', y: 20 }}
                transition={transition}
                style={{
                  maskImage:
                    'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
                  WebkitMaskImage:
                    'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
                  overflow: 'hidden',
                }}
                {...props} />
            } />
        )
      )}
    </AnimatePresence>
  );
}

export { Accordion, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel, useAccordionItem };
