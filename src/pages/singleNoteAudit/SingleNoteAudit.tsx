import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  AlertTriangle,
  Hash,
  User,
  Calendar,
  ClipboardList,
  Code,
  Bot,
  ChartColumn,
  TrendingUp,
  ListChecks,
  Lightbulb,
  Target,
  Eye,
  MessageSquare,
  RefreshCcw,
  Send,
  Flag,
  Sparkles,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NoteDetail {
  id: string;
  date: string;
  practitioner: string;
  cptCode: string;
  noteType: string;
  aiReviews: number;
  auditScore: number;
  lastRun: string;
  summary: string;
  issues: {
    severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
    category: string;
    points: number;
    description: string;
    sectionId: string;
  }[];
}

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

const SingleNoteAudit = () => {
  const navigate = useNavigate();
  const [noteDetail, setNoteDetail] = useState<NoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [accordionValue, setAccordionValue] = useState<string[]>(['si-hi']);

  const isGoodAuditScore = noteDetail ? noteDetail.auditScore > 50 : false;

  // Dummy API call to fetch note details
  const fetchNoteDetail = async (id: string): Promise<NoteDetail> => {
    await new Promise(resolve => setTimeout(resolve, 1200));

    return {
      id: id,
      date: 'Feb 9, 2025',
      practitioner: 'Jane Thompson',
      cptCode: '90791',
      noteType: 'Progress Note',
      aiReviews: 1,
      auditScore: 82,
      lastRun: 'Feb 9, 2025 – 10:32 AM',
      summary:
        'This progress note demonstrates adequate clinical documentation with appropriate coverage of therapeutic interventions and patient response. However, several areas require attention to meet full compliance standards, particularly regarding diagnostic criteria specificity and treatment plan measurability.',
      issues: [
        {
          severity: 'CRITICAL',
          category: 'Assessment & Therapeutic Intervention',
          points: 25,
          description:
            'Missing specific DSM-5 diagnostic criteria documentation. Clinical assessment lacks measurable symptoms or severity indicators required for medical necessity.',
          sectionId: 'zad8-1',
        },
        {
          severity: 'MODERATE',
          category: 'Plan & Collaboration',
          points: 10,
          description:
            'Treatment plan lacks specific, measurable goals. Coordination with psychiatrist mentioned but no documentation of actual communication or consent for information sharing.',
          sectionId: 'hwh-1',
        },
        {
          severity: 'MINOR',
          category: 'Subjective',
          points: 5,
          description:
            'Could benefit from more specific timeline documentation (e.g., exact duration and frequency of symptoms). Current documentation meets minimum requirements.',
          sectionId: '6tx9-1',
        },
      ],
    };
  };

  useEffect(() => {
    const loadNoteDetail = async () => {
      try {
        setLoading(true);
        const detail = await fetchNoteDetail('12439');
        setNoteDetail(detail);
      } catch (error) {
        console.error('Error fetching note detail:', error);
        setNoteDetail(null);
      } finally {
        setLoading(false);
      }
    };

    loadNoteDetail();
  }, []);

  if (loading) {
    return (
      <div>
        <Button onClick={() => navigate('/notes-queue')} className="mb-2">
          <ArrowLeft />
        </Button>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-4">
                <Skeleton className="h-44 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!noteDetail) {
    return (
      <div>
        <Button onClick={() => navigate('/notes-queue')} className="mb-2">
          <ArrowLeft />
        </Button>
        <div className="flex flex-col items-center justify-between">
          <h1 className="text-2xl font-bold">Note not found</h1>
          <p className="mt-2 text-gray-600">Please check the note ID and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Button onClick={() => navigate('/notes-queue')} className="mb-2">
        <ArrowLeft />
      </Button>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Left Sidebar */}
        <div className="space-y-4">
          {/* Basic Information Card */}
          <Card className="bg-white shadow-sm">
            <CardContent className="space-y-7">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-primary flex gap-1 text-sm">
                  <Hash className="text-primary mt-0.5" size={16} />
                  <div>
                    <p className="font-medium">Note ID</p>
                    <p className="text-sm text-black">{noteDetail.id}</p>
                  </div>
                </div>

                <div className="text-primary flex gap-1 text-sm">
                  <User className="text-primary mt-0.5" size={16} />
                  <div>
                    <p className="font-medium">Practitioner</p>
                    <p className="text-sm text-black">{noteDetail.practitioner}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-primary flex gap-1 text-sm">
                  <Calendar className="text-primary mt-0.5" size={16} />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm text-black">{noteDetail.date}</p>
                  </div>
                </div>

                <div className="text-primary flex gap-1 text-sm">
                  <ClipboardList className="text-primary mt-0.5" size={16} />
                  <div>
                    <p className="font-medium">Note Type</p>
                    <p className="text-sm text-black">{noteDetail.noteType}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-primary flex gap-1 text-sm">
                  <Code className="text-primary mt-0.5" size={16} />
                  <div>
                    <p className="font-medium">CPT Code</p>
                    <p className="text-sm text-black">{noteDetail.cptCode}</p>
                  </div>
                </div>

                <div className="text-primary flex gap-1 text-sm">
                  <Bot className="text-primary mt-0.5" size={16} />
                  <div>
                    <p className="font-medium">AI Reviews</p>
                    <p className="text-sm text-black">{noteDetail.aiReviews}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Note Sections Accordion */}
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
        </div>

        {/* Right Content */}
        <div className="space-y-4">
          {/* Audit Score Card */}
          <Card
            className={`overflow-hidden bg-gradient-to-br from-gray-100 ${isGoodAuditScore ? 'to-primary-light' : 'via-red-200 to-red-700'} shadow-sm`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="text-primary">
                  <div className="mb-3 flex items-center gap-2 text-base font-medium">
                    <ChartColumn />
                    <span>Audit Score</span>
                  </div>
                  <div className="flex items-baseline gap-2 text-6xl font-bold">
                    <span>{noteDetail.auditScore}</span>
                    <span>/ 100</span>
                  </div>
                  <p className="mt-3 text-sm">Last AI run: {noteDetail.lastRun}</p>
                </div>
                <Badge
                  className={`text-primary text-md rounded-full border-gray-50 bg-gradient-to-br from-gray-50 px-8 py-2 font-semibold shadow-sm ${isGoodAuditScore ? 'to-primary-light' : 'via-red-300 to-red-700'}`}
                >
                  {isGoodAuditScore ? 'PASS' : 'FAILED'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* AI Summary Card */}
          <Card className="gap-1 shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
                <Sparkles />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-gray-700">{noteDetail.summary}</p>
            </CardContent>
          </Card>

          {/* Issues Identified Card */}
          <Card className="gap-1 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
                <Info />
                Issues Identified
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {noteDetail.issues.map((issue, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={`px-3 py-1 text-xs font-semibold uppercase ${
                        issue.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-700 hover:bg-red-100'
                          : issue.severity === 'MODERATE'
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      {issue.severity}
                    </Badge>
                    <span className="text-xs font-medium text-gray-500">{issue.sectionId}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{issue.category}</h3>
                    <p className="mt-1 text-sm font-bold text-red-600">–{issue.points} points</p>
                    <p className="mt-2 text-xs leading-relaxed text-gray-600">{issue.description}</p>
                  </div>
                  {index < noteDetail.issues.length - 1 && <div className="border-t border-gray-100 pt-3" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="p-2">
            <Button className="to-primary-light text-primary h-12 w-full border-0 bg-gradient-to-r from-gray-50 shadow-sm">
              <RefreshCcw />
              Re-Run Audit
            </Button>
            <Button variant="outline" className="border-primary text-primary h-12 w-full border-2">
              <Send />
              Send to Practitioner
            </Button>
            <Button variant="ghost" className="h-12 w-full">
              <Flag />
              Flag for Manager Review
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SingleNoteAudit;
