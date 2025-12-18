import { ColorKeyItem } from '@/shared/ColorKeyItem';

export const ManagerColorKey = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-8">
          {/* HUMAN DECISION */}
          <div>
            <h4 className="text-primary mb-2 text-sm font-semibold">HUMAN DECISION</h4>
            <div className="space-y-2">
              <ColorKeyItem label="Approve with Edits" gradient="bg-gradient-workflow-completed" />
              <ColorKeyItem label="Return to Practitioner" gradient="bg-gradient-workflow-returned" />
              <ColorKeyItem label="Note is clinically acceptable despite AI issues" gradient="bg-gradient-priority-medium" />
              <ColorKeyItem label="Note needs practitioner correction" gradient="bg-gradient-priority-low" />
              <ColorKeyItem label="Escalate to Office Manager" gradient="bg-gradient-neutral" />
            </div>
          </div>

          {/* AI/HUMAN DISAGREEMENT */}
          <div>
            <h4 className="text-primary mb-2 text-sm font-semibold">AI/HUMAN DISAGREEMENT</h4>
            <div className="space-y-2">
              <ColorKeyItem label="High" gradient="bg-gradient-priority-high" />
              <ColorKeyItem label="Medium" gradient="bg-gradient-priority-medium" />
              <ColorKeyItem label="Low" gradient="bg-gradient-priority-low" />
              <ColorKeyItem label="None" gradient="bg-gradient-workflow-completed" />
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
        </div>
      </div>
    </div>
  );
};
