interface ColorKeyItemProps {
  label: string;
  gradient: string;
}

const ColorKeyItem = ({ label, gradient }: ColorKeyItemProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-4 w-6 rounded ${gradient}`} />
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
};

export const ColorKey = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Left Column */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-8">
          {/* AI STATUS */}
          <div>
            <h4 className="text-primary mb-2 text-sm font-semibold">AI STATUS</h4>
            <div className="space-y-2">
              <ColorKeyItem label="Passed" gradient="bg-gradient-ai-passed" />
              <ColorKeyItem label="Failed" gradient="bg-gradient-ai-failed" />
              <ColorKeyItem label="Warning" gradient="bg-gradient-ai-warning" />
              <ColorKeyItem label="Needs Review" gradient="bg-gradient-ai-needs-review" />
              <ColorKeyItem label="Not Reviewed" gradient="bg-gradient-ai-not-reviewed" />
            </div>
          </div>

          {/* HUMAN REVIEW */}
          <div>
            <h4 className="text-primary mb-2 text-sm font-semibold">HUMAN REVIEW</h4>
            <div className="space-y-2">
              <ColorKeyItem label="Pending" gradient="bg-gradient-human-pending" />
              <ColorKeyItem label="Completed" gradient="bg-gradient-human-completed" />
              <ColorKeyItem label="Not Needed" gradient="bg-gradient-human-not-needed" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* MANAGER REVIEW */}
          <div>
            <h4 className="text-primary mb-2 text-sm font-semibold">MANAGER REVIEW</h4>
            <div className="space-y-2">
              <ColorKeyItem label="Pending" gradient="bg-gradient-manager-pending" />
              <ColorKeyItem label="In Progress" gradient="bg-gradient-manager-in-progress" />
              <ColorKeyItem label="Completed" gradient="bg-gradient-manager-completed" />
              <ColorKeyItem label="Not Needed" gradient="bg-gradient-manager-not-needed" />
            </div>
          </div>

          {/* WORKFLOW STATUS */}
          <div>
            <h4 className="text-primary mb-2 text-sm font-semibold">WORKFLOW STATUS</h4>
            <div className="space-y-2">
              <ColorKeyItem label="In Queue" gradient="bg-gradient-workflow-in-queue" />
              <ColorKeyItem label="Returned" gradient="bg-gradient-workflow-returned" />
              <ColorKeyItem label="Blacklisted" gradient="bg-gradient-workflow-blacklisted" />
              <ColorKeyItem label="Completed" gradient="bg-gradient-workflow-completed" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* PRIORITY */}
          <div>
            <h4 className="text-primary mb-2 text-sm font-semibold">PRIORITY</h4>
            <div className="space-y-2">
              <ColorKeyItem label="High" gradient="bg-gradient-priority-high" />
              <ColorKeyItem label="Medium" gradient="bg-gradient-priority-medium" />
              <ColorKeyItem label="Low" gradient="bg-gradient-priority-low" />
            </div>
          </div>
          {/* REVIEW CYCLE */}
          <div>
            <h4 className="text-primary mb-2 text-sm font-semibold">REVIEW CYCLE</h4>
            <div className="space-y-2">
              <ColorKeyItem label="Cycle 1" gradient="bg-gradient-review-cycle-1" />
              <ColorKeyItem label="Cycle 2" gradient="bg-gradient-review-cycle-2" />
              <ColorKeyItem label="Cycle 3" gradient="bg-gradient-review-cycle-3" />
              <ColorKeyItem label="Blacklisted" gradient="bg-gradient-review-cycle-blacklisted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
