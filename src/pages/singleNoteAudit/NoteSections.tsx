import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageSquare, Eye, Target, Lightbulb, ListChecks, TrendingUp } from 'lucide-react';

const noteSections = [
  {
    id: 'subjective',
    title: 'Subjective',
    code: '6x9-1',
    extractkey: '6tx9-1_subjective',
    icon: MessageSquare,
  },
  {
    id: 'objective',
    title: 'Objective',
    code: 'n2t-1',
    extractkey: 'rb2f-1_objective',
    icon: Eye,
  },
  {
    id: 'assessment',
    title: 'Assessment & Therapeutic Intervention',
    code: 'zxd8-1',
    extractkey: 'zad8-1_asment_&_therapeutic_intervention',
    icon: Target,
  },
  {
    id: 'reaction',
    title: 'Reaction to Intervention',
    code: 'ugp6-1',
    extractkey: 'ugq6-1_reaction_to_intervention',
    icon: Lightbulb,
  },
  {
    id: 'plan',
    title: 'Plan & Collaboration',
    code: 'hnh-1',
    extractkey: 'hnfi-1_plan_and_collaboration',
    icon: ListChecks,
  },
  {
    id: 'progress',
    title: 'Progress',
    code: 'gmlp-1',
    extractkey: 'gm4p-1_progress',
    icon: TrendingUp,
  },
  // {
  //   id: 'si-hi',
  //   title: 'SI / HI',
  //   code: 'lx3p-7',
  //   extractkey: 'kxgx-7_&_kxgx-8_suicidality/homicidality',
  //   icon: AlertTriangle,
  // },
];

interface NoteSectionsProps {
  bedrockResponse: any;
  openSectionId?: string;
  onSectionChange?: (value: string[]) => void;
}

const NoteSections = ({ bedrockResponse, openSectionId, onSectionChange }: NoteSectionsProps) => {
  const [accordionValue, setAccordionValue] = useState<string[]>(['subjective']);

  // Update accordion when openSectionId prop changes
  useEffect(() => {
    if (openSectionId) {
      const newValue = [openSectionId];
      setAccordionValue(newValue);
      onSectionChange?.(newValue);
    }
  }, [openSectionId, onSectionChange]);

  // Function to get content from bedrockResponse or fallback to default
  const getSectionContent = (extractKey: string): string => {
    if (!bedrockResponse) return '';

    const content = (bedrockResponse as any)[extractKey];

    return content && content.trim() !== '' ? content : 'No content available for this section.';
  };

  return (
    <Card className="p-1">
      <CardContent className="p-0">
        <Accordion
          type="multiple"
          value={accordionValue}
          onValueChange={value => {
            setAccordionValue(value);
            onSectionChange?.(value);
          }}
          className="w-full"
        >
          {noteSections.map(section => {
            const IconComponent = section.icon;
            const isActive = accordionValue.includes(section.id);
            const content = getSectionContent(section.extractkey);

            return (
              <AccordionItem key={section.id} value={section.id} className="border-b-0">
                <AccordionTrigger
                  className={`flex w-full items-center justify-between p-4 text-left transition-all hover:no-underline ${
                    isActive && 'bg-active-accordion'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent size={20} className={isActive ? 'text-primary' : 'text-black'} />
                    <p className={`font-medium ${isActive ? 'text-primary' : 'text-black'}`}>{section.title}</p>
                    <p className={`font-light text-gray-500 ${isActive ? 'text-primary' : 'text-black'}`}>({section.code})</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 text-sm leading-relaxed text-gray-800">{content}</AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default NoteSections;
