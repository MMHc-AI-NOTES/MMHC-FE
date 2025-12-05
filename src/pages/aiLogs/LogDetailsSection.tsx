import { AILog } from '@/types/aiLogs';
import { Agent } from '@/types/agent';
import LogDetailsCard from './LogDetailsCard';
import ModelInfoCard from './ModelInfoCard';
import AIHumanComparisonCard from './AIHumanComparisonCard';
import ReRunAuditCard from './ReRunAuditCard';
import PromptOutputTabs from './PromptOutputTabs';

interface LogDetailsSectionProps {
  log: AILog;
  agents: Agent[];
  onReRunAudit?: (samePrompt: boolean, agentId?: number) => void;
}

const LogDetailsSection = ({ log, agents, onReRunAudit }: LogDetailsSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <LogDetailsCard log={log} />
          <ModelInfoCard log={log} />
          <AIHumanComparisonCard log={log} />
          <ReRunAuditCard log={log} agents={agents} onReRunAudit={onReRunAudit} />
        </div>

        {/* Right Column */}
        <PromptOutputTabs log={log} />
      </div>
    </div>
  );
};

export default LogDetailsSection;
