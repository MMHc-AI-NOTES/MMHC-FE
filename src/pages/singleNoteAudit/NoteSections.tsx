import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertTriangle, MessageSquare, Eye, Target, Lightbulb, ListChecks, TrendingUp } from 'lucide-react';

const noteSections = [
  {
    id: 'subjective',
    title: 'Subjective',
    code: '6x9-1',
    icon: MessageSquare,
    content:
      'Patient reports continued feelings of sadness and anxiety over the past two weeks. States sleep has been disrupted with difficulty falling asleep most nights. Reports decreased appetite and energy levels. Denies substance use.',
  },
  {
    id: 'objective',
    title: 'Objective',
    code: 'n2t-1',
    icon: Eye,
    content:
      'Patient appeared well-groomed and cooperative. Mood was congruent with affect. Speech was clear and goal-directed. Eye contact was appropriate. No psychomotor agitation or retardation observed.',
  },
  {
    id: 'assessment',
    title: 'Assessment & Therapeutic Intervention',
    code: 'zxd8-1',
    icon: Target,
    content:
      'Continued symptoms of depression with anxiety. Utilized cognitive restructuring techniques to address negative thought patterns. Patient demonstrated good insight into connection between thoughts and emotions.',
  },
  {
    id: 'reaction',
    title: 'Reaction to Intervention',
    code: 'ugp6-1',
    icon: Lightbulb,
    content:
      'Patient responded positively to therapeutic interventions. Reported feeling more hopeful about implementing coping strategies discussed. Expressed willingness to practice techniques between sessions.',
  },
  {
    id: 'plan',
    title: 'Plan & Collaboration',
    code: 'hnh-1',
    icon: ListChecks,
    content:
      'Continue weekly therapy sessions. Patient to practice mindfulness exercises daily. Follow up with psychiatrist regarding medication management. Patient agreed to contact crisis line if symptoms worsen.',
  },
  {
    id: 'progress',
    title: 'Progress',
    code: 'gmlp-1',
    icon: TrendingUp,
    content:
      'Patient showing gradual improvement in mood regulation. Continues to work on developing healthy coping mechanisms. Reports increased awareness of triggers and better ability to use grounding techniques.',
  },
  {
    id: 'si-hi',
    title: 'SI / HI',
    code: 'lx3p-7',
    icon: AlertTriangle,
    content:
      'Patient denies current suicidal ideation, intent, or plan. Denies homicidal ideation. Safety plan reviewed and remains in place. Patient verbalizes understanding of crisis resources.',
    highlight: true,
  },
];

const NoteSections = () => {
  const [accordionValue, setAccordionValue] = useState<string[]>(['si-hi']);

  return (
    <Card className="p-1 shadow-sm">
      <CardContent className="p-0">
        <Accordion type="multiple" value={accordionValue} onValueChange={setAccordionValue} className="w-full">
          {noteSections.map(section => {
            const IconComponent = section.icon;
            const isActive = accordionValue.includes(section.id);

            return (
              <AccordionItem key={section.id} value={section.id} className="border-b-0">
                <AccordionTrigger
                  className={`flex w-full items-center justify-between p-4 text-left transition-all hover:no-underline ${
                    isActive && 'from-primary-light bg-gradient-to-r to-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent size={20} className={isActive ? 'text-primary' : 'text-black'} />
                    <p className={`font-medium ${isActive ? 'text-primary' : 'text-black'}`}>{section.title}</p>
                    <p className={`text-sm ${isActive ? 'text-primary' : 'text-black'}`}>({section.code})</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 text-sm leading-relaxed text-gray-800">{section.content}</AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default NoteSections;
