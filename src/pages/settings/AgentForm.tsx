import React from 'react';
import { useFormik } from 'formik';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Agent, CreateAgentRequest } from '@/types/agent';
import * as yup from 'yup';
import InputField from '@/shared/InputField';
import SliderField from '@/shared/SliderField';
import { AgentModelKeys, PromptKeyEnum, PromptKeyLabels, SLIDER_CONFIGS } from '@/constants/common';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { DialogFooter } from '@/components/ui/dialog';
import { getAgentModelOptions } from '@/utils/helper';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface AgentFormProps {
  agent?: Agent;
  onSubmit: (data: CreateAgentRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const agentValidationSchema = yup.object({
  name: yup.string().required('Agent name is required'),
  model: yup.string().required('Model is required'),
  is_default: yup.number().required(),
  temperature: yup.number().min(0).max(2).required('Temperature is required'),
  top_k: yup.number().min(0).max(1000).required('Frequency penalty is required'),
  top_p: yup.number().min(0).max(1).required('Presence penalty is required'),
  previous_section: yup.array().of(yup.number()).required(),
  prompt: yup.string().required('Prompt is required'),
});

interface AgentFormValues {
  name: string;
  model: string;
  is_default: number;
  temperature: number;
  top_k: number;
  top_p: number;
  previous_section: number[];
  // single backend prompt (we'll compose this from section prompts before submit)
  prompt: string;
  description: string;

  // Section-specific prompts (UI only)
  mental_status_prompt: string;
  suicidality_prompt: string;
  homicidality_prompt: string;
  subjective_prompt: string;
  objective_prompt: string;
  assessment_prompt: string;
  reaction_prompt: string;
  plan_prompt: string;
  reflection_prompt: string;
  progress_prompt: string;
  aggregator_prompt: string;

  // Section-specific sliders (UI-only; keep backend sliders unchanged)
  temperature_mental_status: number;
  top_p_mental_status: number;
  top_k_mental_status: number;
  temperature_suicidality: number;
  top_p_suicidality: number;
  top_k_suicidality: number;
  temperature_homicidality: number;
  top_p_homicidality: number;
  top_k_homicidality: number;
  temperature_subjective: number;
  top_p_subjective: number;
  top_k_subjective: number;
  temperature_objective: number;
  top_p_objective: number;
  top_k_objective: number;
  temperature_assessment: number;
  top_p_assessment: number;
  top_k_assessment: number;
  temperature_reaction: number;
  top_p_reaction: number;
  top_k_reaction: number;
  temperature_plan: number;
  top_p_plan: number;
  top_k_plan: number;
  temperature_reflection: number;
  top_p_reflection: number;
  top_k_reflection: number;
  temperature_progress: number;
  top_p_progress: number;
  top_k_progress: number;
  temperature_aggregator: number;
  top_p_aggregator: number;
  top_k_aggregator: number;

  // temperature_risk: number;
  // top_p_risk: number;
  // top_k_risk: number;
  // Risk assessment
  // risk_prompt: string;
}

// Tooltip content for each parameter
const TOOLTIP_CONTENT = {
  temperature: {
    title: 'Temperature',
    description:
      'Controls randomness: Lower values make responses more deterministic and focused, while higher values make them more creative and diverse. Range: 0 to 1',
  },
  top_k: {
    title: 'Top K',
    description: 'Reduces repetition by penalizing frequently used tokens. Higher values decrease repetition. Range: 0 to 1000',
  },
  top_p: {
    title: 'Top P',
    description: 'Encourages new topics by penalizing tokens that have already appeared. Higher values promote new concepts. Range: 0 to 1',
  },
};

// Section descriptors to drive the accordion rendering (keeps UI DRY)
const SECTIONS: { key: string; title: string; description: string; promptField: keyof AgentFormValues }[] = [
  {
    key: PromptKeyEnum.mental_status,
    title: PromptKeyLabels[PromptKeyEnum.mental_status],
    description: 'Instructions for generating the Mental Status section',
    promptField: 'mental_status_prompt',
  },
  {
    key: PromptKeyEnum.suicidality,
    title: PromptKeyLabels[PromptKeyEnum.suicidality],
    description: 'Instructions for generating the Suicidality section',
    promptField: 'suicidality_prompt',
  },
  {
    key: PromptKeyEnum.homicidality,
    title: PromptKeyLabels[PromptKeyEnum.homicidality],
    description: 'Instructions for generating the Homicidality section',
    promptField: 'homicidality_prompt',
  },
  {
    key: PromptKeyEnum.subjective,
    title: PromptKeyLabels[PromptKeyEnum.subjective],
    description: 'Instructions for generating the Subjective section',
    promptField: 'subjective_prompt',
  },
  {
    key: PromptKeyEnum.objective,
    title: PromptKeyLabels[PromptKeyEnum.objective],
    description: 'Instructions for generating the Objective section',
    promptField: 'objective_prompt',
  },
  {
    key: PromptKeyEnum.assessment_therapeutic_intervention,
    title: PromptKeyLabels[PromptKeyEnum.assessment_therapeutic_intervention],
    description: 'Assessment, clinical reasoning, and interventions applied',
    promptField: 'assessment_prompt',
  },
  {
    key: PromptKeyEnum.reaction_to_intervention,
    title: PromptKeyLabels[PromptKeyEnum.reaction_to_intervention],
    description: 'Client response to interventions',
    promptField: 'reaction_prompt',
  },
  {
    key: PromptKeyEnum.plan_and_collaboration,
    title: PromptKeyLabels[PromptKeyEnum.plan_and_collaboration],
    description: 'Next steps, goals, referrals, and shared decisions',
    promptField: 'plan_prompt',
  },
  {
    key: PromptKeyEnum.therapist_reflection,
    title: PromptKeyLabels[PromptKeyEnum.therapist_reflection],
    description: 'Therapist insights, reflections, and clinical notes',
    promptField: 'reflection_prompt',
  },
  {
    key: PromptKeyEnum.progress,
    title: PromptKeyLabels[PromptKeyEnum.progress],
    description: 'Changes since the previous session',
    promptField: 'progress_prompt',
  },
  {
    key: PromptKeyEnum.aggregator,
    title: PromptKeyLabels[PromptKeyEnum.aggregator],
    description: 'Instructions for generating the Aggregate section',
    promptField: 'aggregator_prompt',
  },
  // {r
  //   key: PromptKeyEnum.risk_assessment,
  //   title: PromptKeyLabels[PromptKeyEnum.risk_assessment],
  //   description: 'Instructions for generating the Risk Assessment section',
  //   promptField: 'risk_prompt',
  // },
];

const AgentForm: React.FC<AgentFormProps> = ({ agent, onSubmit, onCancel, isSubmitting }) => {
  const formik = useFormik<AgentFormValues>({
    initialValues: {
      name: agent?.name || '',
      model: agent?.model || AgentModelKeys.CLAUDE_3_5_HAIKU_V1,
      is_default: agent?.is_default ? 1 : 0,
      temperature: agent?.temperature ?? 0,
      top_k: agent?.top_k ?? 0,
      top_p: agent?.top_p ?? 0,
      previous_section: agent?.previous_section || [],
      prompt: agent?.prompt || '',
      description: agent?.description || '',

      // UI-only section prompts default to empty or fall back to main prompt
      mental_status_prompt: agent?.prompt || '',
      suicidality_prompt: agent?.prompt || '',
      homicidality_prompt: agent?.prompt || '',
      subjective_prompt: agent?.prompt || '',
      objective_prompt: agent?.prompt || '',
      assessment_prompt: '',
      reaction_prompt: '',
      plan_prompt: '',
      reflection_prompt: '',
      progress_prompt: '',
      aggregator_prompt: '',

      // per-section slider defaults (use agent defaults if present)
      temperature_mental_status: agent?.temperature ?? 0,
      top_p_mental_status: agent?.top_p ?? 0,
      top_k_mental_status: agent?.top_k ?? 0,
      temperature_suicidality: agent?.temperature ?? 0,
      top_p_suicidality: agent?.top_p ?? 0,
      top_k_suicidality: agent?.top_k ?? 0,
      temperature_homicidality: agent?.temperature ?? 0,
      top_p_homicidality: agent?.top_p ?? 0,
      top_k_homicidality: agent?.top_k ?? 0,
      temperature_subjective: agent?.temperature ?? 0,
      top_p_subjective: agent?.top_p ?? 0,
      top_k_subjective: agent?.top_k ?? 0,
      temperature_objective: agent?.temperature ?? 0,
      top_p_objective: agent?.top_p ?? 0,
      top_k_objective: agent?.top_k ?? 0,
      temperature_assessment: agent?.temperature ?? 0,
      top_p_assessment: agent?.top_p ?? 0,
      top_k_assessment: agent?.top_k ?? 0,
      temperature_reaction: agent?.temperature ?? 0,
      top_p_reaction: agent?.top_p ?? 0,
      top_k_reaction: agent?.top_k ?? 0,
      temperature_plan: agent?.temperature ?? 0,
      top_p_plan: agent?.top_p ?? 0,
      top_k_plan: agent?.top_k ?? 0,
      temperature_reflection: agent?.temperature ?? 0,
      top_p_reflection: agent?.top_p ?? 0,
      top_k_reflection: agent?.top_k ?? 0,
      temperature_progress: agent?.temperature ?? 0,
      top_p_progress: agent?.top_p ?? 0,
      top_k_progress: agent?.top_k ?? 0,
      temperature_aggregator: agent?.temperature ?? 0,
      top_p_aggregator: agent?.top_p ?? 0,
      top_k_aggregator: agent?.top_k ?? 0,
      // temperature_risk: agent?.temperature ?? 0,
      // top_p_risk: agent?.top_p ?? 0,
      // top_k_risk: agent?.top_k ?? 0,
      // risk_prompt: '',
    },
    validationSchema: agentValidationSchema,
    onSubmit: async values => {
      // Compose a single backend prompt from the section prompts in the required order
      const sections: { title: string; text?: string }[] = [
        { title: PromptKeyLabels[PromptKeyEnum.mental_status], text: values.mental_status_prompt },
        { title: PromptKeyLabels[PromptKeyEnum.suicidality], text: values.suicidality_prompt },
        { title: PromptKeyLabels[PromptKeyEnum.homicidality], text: values.homicidality_prompt },
        { title: PromptKeyLabels[PromptKeyEnum.subjective], text: values.subjective_prompt },
        { title: PromptKeyLabels[PromptKeyEnum.objective], text: values.objective_prompt },
        { title: PromptKeyLabels[PromptKeyEnum.assessment_therapeutic_intervention], text: values.assessment_prompt },
        { title: PromptKeyLabels[PromptKeyEnum.reaction_to_intervention], text: values.reaction_prompt },
        { title: PromptKeyLabels[PromptKeyEnum.plan_and_collaboration], text: values.plan_prompt },
        { title: PromptKeyLabels[PromptKeyEnum.therapist_reflection], text: values.reflection_prompt },
        { title: PromptKeyLabels[PromptKeyEnum.progress], text: values.progress_prompt },
        // { title: PromptKeyLabels[PromptKeyEnum.risk_assessment], text: values.risk_prompt },
      ];

      const composedPrompt = sections
        .filter(s => s.text && s.text.trim() !== '')
        .map(s => `=== ${s.title} ===\n${s.text}`)
        .join('\n\n');

      // Set the composed prompt into the field expected by the backend
      const submitValues = {
        ...values,
        prompt: composedPrompt || values.prompt,
        // keep model/sliders mapped to the main fields (we expose them in both Subjective/Objective but bind to same keys)
        description: values.description.trim() === '' ? null : values.description,
      } as unknown as CreateAgentRequest;

      await onSubmit(submitValues);
    },
  });

  // Tooltip component for consistent styling
  const InfoTooltip = ({ content }: { content: { title: string; description: string } }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="text-muted-foreground h-4 w-4 cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-semibold">{content.title}</p>
        <p className="text-sm">{content.description}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider>
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-4 space-y-4 px-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end space-x-2">
              <Switch
                id="is_default"
                checked={formik.values.is_default ? true : false}
                onCheckedChange={(checked: any) => formik.setFieldValue('is_default', checked ? 1 : 0)}
              />
              <Label htmlFor="is_default" className="cursor-pointer">
                Set as Default
              </Label>
            </div>

            {/* Basic agent details (moved out of accordion) */}
            <div className="space-y-3">
              <InputField id="name" placeholder="Enter agent name" formik={formik} label="Agent Name" />

              <div>
                <Label htmlFor="description">Description</Label>
                <p className="text-sm text-gray-500">Explain what this agent does and when it should be used</p>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter agent description..."
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="mt-2"
                />
                {formik.touched.description && formik.errors.description && (
                  <div className="mt-1 text-sm text-red-500">{formik.errors.description}</div>
                )}
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible defaultValue={SECTIONS[0].key} className="w-full rounded-lg border">
            {SECTIONS.map(s => (
              <AccordionItem key={s.key} value={s.key} className="rounded-lg bg-white">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <span className="text-sm font-semibold text-slate-800">{s.title}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4 pt-2">
                    <div>
                      <Label htmlFor={s.promptField}>{'Prompt'}</Label>
                      <p className="text-sm text-gray-500">{s.description}</p>
                      <Textarea
                        id={s.promptField}
                        name={s.promptField}
                        placeholder={`Enter ${s.title.toLowerCase()} prompt...`}
                        value={(formik.values as any)[s.promptField]}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="model">Model</Label>
                        <Select value={formik.values.model} onValueChange={value => formik.setFieldValue('model', value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getAgentModelOptions().map(model => (
                              <SelectItem key={model.key} value={model.value}>
                                {model.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`temperature_${s.key}`} className="text-sm font-medium">
                            Temperature
                          </Label>
                          <InfoTooltip content={TOOLTIP_CONTENT.temperature} />
                        </div>
                        <div className="mt-2">
                          <SliderField
                            id={`temperature_${s.key}`}
                            formik={formik}
                            label=""
                            min={SLIDER_CONFIGS.TEMPERATURE.min}
                            max={SLIDER_CONFIGS.TEMPERATURE.max}
                            step={SLIDER_CONFIGS.TEMPERATURE.step}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`top_p_${s.key}`} className="text-sm font-medium">
                            Top P
                          </Label>
                          <InfoTooltip content={TOOLTIP_CONTENT.top_p} />
                        </div>
                        <div className="mt-2">
                          <SliderField
                            id={`top_p_${s.key}`}
                            formik={formik}
                            label=""
                            min={SLIDER_CONFIGS.TOP_P.min}
                            max={SLIDER_CONFIGS.TOP_P.max}
                            step={SLIDER_CONFIGS.TOP_P.step}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`top_k_${s.key}`} className="text-sm font-medium">
                            Top K
                          </Label>
                          <InfoTooltip content={TOOLTIP_CONTENT.top_k} />
                        </div>
                        <div className="mt-2">
                          <SliderField
                            id={`top_k_${s.key}`}
                            formik={formik}
                            label=""
                            min={SLIDER_CONFIGS.TOP_K.min}
                            max={SLIDER_CONFIGS.TOP_K.max}
                            step={SLIDER_CONFIGS.TOP_K.step}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <DialogFooter className="border-t p-4">
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-light text-primary border-0 font-semibold shadow-sm">
              {isSubmitting ? 'Saving...' : agent ? 'Update Agent' : 'Create Agent'}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </TooltipProvider>
  );
};

export default AgentForm;
