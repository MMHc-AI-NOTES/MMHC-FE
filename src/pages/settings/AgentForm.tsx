import React from 'react';
import { useFormik } from 'formik';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Agent, CreateAgentRequest } from '@/types/agent';
import * as yup from 'yup';
import InputField from '@/shared/InputField';
import SliderField from '@/shared/SliderField';
import { AGENT_MODEL_DISPLAY_NAMES, AGENT_MODEL_KEYS } from '@/constants';
import { SLIDER_CONFIGS } from '@/constants/common';

interface AgentFormProps {
  agent?: Agent;
  onSubmit: (data: CreateAgentRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const agentValidationSchema = yup.object({
  name: yup.string().required('Agent name is required'),
  model: yup.string().required('Model is required'),
  use_context: yup.boolean().required(),
  temperature: yup.number().min(0).max(2).required('Temperature is required'),
  frequency_penalty: yup.number().min(-2).max(2).required('Frequency penalty is required'),
  presence_penalty: yup.number().min(-2).max(2).required('Presence penalty is required'),
  previous_section: yup.array().of(yup.number()).required(),
  transcript: yup.boolean().required(),
  prompt: yup.string().required('Prompt is required'),
  description: yup.string().required('Description is required'),
  type: yup
    .number()
    .oneOf([1, 2, 3] as const)
    .required('Type is required'),
});

interface AgentFormValues {
  name: string;
  model: string;
  use_context: boolean;
  temperature: number;
  frequency_penalty: number;
  presence_penalty: number;
  previous_section: number[];
  transcript: boolean;
  prompt: string;
  description: string;
  type: 1 | 2 | 3;
}

// Convert agentModelKeys to an array for easier iteration
const modelOptions = Object.entries(AGENT_MODEL_KEYS).map(([key, value]) => ({
  key: key as keyof typeof AGENT_MODEL_KEYS,
  value,
  displayName: AGENT_MODEL_DISPLAY_NAMES[key as keyof typeof AGENT_MODEL_KEYS],
}));

const AgentForm: React.FC<AgentFormProps> = ({ agent, onSubmit, onCancel, isSubmitting }) => {
  const formik = useFormik<AgentFormValues>({
    initialValues: {
      name: agent?.name || '',
      model: agent?.model || AGENT_MODEL_KEYS.CLAUDE_3_5_SONNET_V2,
      use_context: agent?.use_context || true,
      temperature: agent?.temperature || 0.5,
      frequency_penalty: agent?.frequency_penalty || 0,
      presence_penalty: agent?.presence_penalty || 0,
      previous_section: agent?.previous_section || [],
      transcript: agent?.transcript || false,
      prompt: agent?.prompt || '',
      description: agent?.description || '',
      type: agent?.type || 2,
    },
    validationSchema: agentValidationSchema,
    onSubmit: async values => {
      await onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-3">
      <InputField id="name" placeholder="Enter agent name" formik={formik} label="Agent Name" />
      <InputField id="description" placeholder="Enter agent description" formik={formik} label="Description" />

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

      <div className="grid grid-cols-2 gap-4">
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

        <div className="w-full space-y-2">
          <Label htmlFor="type">Agent Type</Label>
          <Select value={formik.values.type.toString()} onValueChange={value => formik.setFieldValue('type', parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem value="1">System</SelectItem>
              <SelectItem value="2">SOAP</SelectItem>
              <SelectItem value="3">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="use_context"
            checked={formik.values.use_context}
            onCheckedChange={checked => formik.setFieldValue('use_context', checked)}
          />
          <Label htmlFor="use_context">Use Context</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="transcript"
            checked={formik.values.transcript}
            onCheckedChange={checked => formik.setFieldValue('transcript', checked)}
          />
          <Label htmlFor="transcript">Read Transcript</Label>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SliderField
          id="temperature"
          formik={formik}
          label="Temperature"
          min={SLIDER_CONFIGS.TEMPERATURE.min}
          max={SLIDER_CONFIGS.TEMPERATURE.max}
          step={SLIDER_CONFIGS.TEMPERATURE.step}
          className="rounded-lg border bg-white p-4 shadow"
        />

        <SliderField
          id="frequency_penalty"
          formik={formik}
          label="Frequency Penalty"
          min={SLIDER_CONFIGS.FREQUENCY_PENALTY.min}
          max={SLIDER_CONFIGS.FREQUENCY_PENALTY.max}
          step={SLIDER_CONFIGS.FREQUENCY_PENALTY.step}
          className="rounded-lg border bg-white p-4 shadow"
        />

        <SliderField
          id="presence_penalty"
          formik={formik}
          label="Presence Penalty"
          min={SLIDER_CONFIGS.PRESENCE_PENALTY.min}
          max={SLIDER_CONFIGS.PRESENCE_PENALTY.max}
          step={SLIDER_CONFIGS.PRESENCE_PENALTY.step}
          className="rounded-lg border bg-white p-4 shadow"
        />
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
  );
};

export default AgentForm;
