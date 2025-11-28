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
import { AGENT_MODEL_DISPLAY_NAMES, AGENT_MODEL_KEYS } from '@/constants';
import { SLIDER_CONFIGS } from '@/constants/common';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

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
  description: yup.string().required('Description is required'),
});

interface AgentFormValues {
  name: string;
  model: string;
  is_default: number;
  temperature: number;
  top_k: number;
  top_p: number;
  previous_section: number[];
  prompt: string;
  description: string;
}

// Convert agentModelKeys to an array for easier iteration
const modelOptions = Object.entries(AGENT_MODEL_KEYS).map(([key, value]) => ({
  key: key as keyof typeof AGENT_MODEL_KEYS,
  value,
  displayName: AGENT_MODEL_DISPLAY_NAMES[key as keyof typeof AGENT_MODEL_KEYS],
}));

// Tooltip content for each parameter
const TOOLTIP_CONTENT = {
  temperature: {
    title: 'Temperature',
    description:
      'Controls randomness: Lower values make responses more deterministic and focused, while higher values make them more creative and diverse. Range: 0 to 2',
  },
  top_k: {
    title: 'Top K',
    description: 'Reduces repetition by penalizing frequently used tokens. Higher values decrease repetition. Range: -2 to 2',
  },
  top_p: {
    title: 'Top P',
    description:
      'Encourages new topics by penalizing tokens that have already appeared. Higher values promote new concepts. Range: -2 to 2',
  },
};

const AgentForm: React.FC<AgentFormProps> = ({ agent, onSubmit, onCancel, isSubmitting }) => {
  const formik = useFormik<AgentFormValues>({
    initialValues: {
      name: agent?.name || '',
      model: agent?.model || AGENT_MODEL_KEYS.CLAUDE_3_5_HAIKU_V1,
      is_default: agent?.is_default ? 1 : 0,
      temperature: agent?.temperature || 0.5,
      top_k: agent?.top_k || 0,
      top_p: agent?.top_p || 0,
      previous_section: agent?.previous_section || [],
      prompt: agent?.prompt || '',
      description: agent?.description || '',
    },
    validationSchema: agentValidationSchema,
    onSubmit: async values => {
      await onSubmit(values);
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
      <form onSubmit={formik.handleSubmit} className="space-y-3">
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
        <InputField id="name" placeholder="Enter agent name" formik={formik} label="Agent Name" />
        {/* <InputField id="description" placeholder="Enter agent description" formik={formik} label="Description" /> */}

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter agent description..."
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.description && formik.errors.description && (
            <div className="mt-1 text-sm text-red-500">{formik.errors.description}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            name="prompt"
            placeholder="Enter agent prompt..."
            value={formik.values.prompt}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.prompt && formik.errors.prompt && <div className="mt-1 text-sm text-red-500">{formik.errors.prompt}</div>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select value={formik.values.model} onValueChange={value => formik.setFieldValue('model', value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modelOptions.map(model => (
                <SelectItem key={model.key} value={model.value}>
                  {model.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.model && formik.errors.model && <div className="mt-1 text-sm text-red-500">{formik.errors.model}</div>}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border bg-white p-4 shadow">
            <div className="flex items-center gap-2">
              <Label htmlFor="temperature" className="text-sm font-medium">
                Temperature
              </Label>
              <InfoTooltip content={TOOLTIP_CONTENT.temperature} />
            </div>
            <SliderField
              id="temperature"
              formik={formik}
              label=""
              min={SLIDER_CONFIGS.TEMPERATURE.min}
              max={SLIDER_CONFIGS.TEMPERATURE.max}
              step={SLIDER_CONFIGS.TEMPERATURE.step}
            />
          </div>

          <div className="rounded-lg border bg-white p-4 shadow">
            <div className="flex items-center gap-2">
              <Label htmlFor="top_p" className="text-sm font-medium">
                Top P
              </Label>
              <InfoTooltip content={TOOLTIP_CONTENT.top_p} />
            </div>
            <SliderField
              id="top_p"
              formik={formik}
              label=""
              min={SLIDER_CONFIGS.TOP_P.min}
              max={SLIDER_CONFIGS.TOP_P.max}
              step={SLIDER_CONFIGS.TOP_P.step}
            />
          </div>

          <div className="rounded-lg border bg-white p-4 shadow">
            <div className="flex items-center gap-2">
              <Label htmlFor="top_k" className="text-sm font-medium">
                Top K
              </Label>
              <InfoTooltip content={TOOLTIP_CONTENT.top_k} />
            </div>
            <SliderField
              id="top_k"
              formik={formik}
              label=""
              min={SLIDER_CONFIGS.TOP_K.min}
              max={SLIDER_CONFIGS.TOP_K.max}
              step={SLIDER_CONFIGS.TOP_K.step}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : agent ? 'Update Agent' : 'Create Agent'}
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
};

export default AgentForm;
