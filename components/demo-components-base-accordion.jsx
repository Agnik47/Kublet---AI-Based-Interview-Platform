import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from '@/components/animate-ui/components/base/accordion';

const ITEMS = [
  {
    title: 'How does the credit system work?',
    content:
      'You purchase a package of credits. Each 1:1 mock interview session costs one credit. Unused credits roll over, so you never lose what you paid for.',
  },
  {
    title: 'Who will be interviewing me?',
    content:
      'Our interviewers are senior engineers and hiring managers from top-tier tech companies. They have extensive experience conducting real interviews and use our AI co-pilot to ensure you get role-specific, high-quality questions.',
  },
  {
    title: 'What is the AI feedback report?',
    content:
      'After each session, our AI analyzes the interview and generates a detailed feedback report. It highlights your strengths, areas for improvement, and actionable insights to help you perform better in real interviews.',
  },
  {
    title: 'Are the interview sessions recorded?',
    content:
      'Yes! All sessions are conducted over HD video calls and are recorded. You will get an instant playback link after the session ends so you can review your performance and the feedback provided by the interviewer. Yoou will get all if you buy our Pro Subcription',
  },
  {
    title: 'How do I schedule an interview?',
    content:
      'Interviewers list their available slots in their profiles. You can simply browse their schedule, pick an open slot that works for you, and confirm with one click. No back-and-forth emails required.',
  },
];

export const BaseAccordionDemo = ({
  multiple = false,
  keepRendered = false,
  showArrow = true,
  
}) => {
  return (
    <div className="w-full mx-auto bg-[#0f0f11] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden hover:border-amber-400/20">
        <div className="absolute bottom-1 right-1 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.05)_0%,transparent_70%)] pointer-events-none" />
      <Accordion multiple={multiple} className="w-full relative z-10 transition-all duration-300">
        {ITEMS.map((item, index) => (
          <AccordionItem key={index} value={`item-${index + 1}`} className="border-b border-white/10 last:border-0 py-2 transition-all">
            <AccordionTrigger showArrow={showArrow} className="text-stone-200 hover:text-amber-400 hover:no-underline font-serif text-lg tracking-tight transition-colors flex gap-4">
              {item.title}
            </AccordionTrigger>
            <AccordionPanel keepRendered={keepRendered} className="text-stone-400 text-sm leading-relaxed pb-4 pt-2">
              {item.content}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};