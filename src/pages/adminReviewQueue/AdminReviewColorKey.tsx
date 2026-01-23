// @/pages/adminReviewQueue/AdminReviewColorKey.tsx

import { ColorKeyItem } from '@/shared/ColorKeyItem';

export const AdminReviewColorKey = () => {
  return (
    <div className="space-y-6 p-6">
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

          {/* REVIEW STATUS */}
          <div>
            <h4 className="text-primary mb-2 text-sm font-semibold">REVIEW STATUS</h4>
            <div className="space-y-2">
              <ColorKeyItem label="Pending" gradient="bg-gradient-human-pending" />
              <ColorKeyItem label="In Progress" gradient="bg-gradient-manager-in-progress" />
              <ColorKeyItem label="Returned" gradient="bg-gradient-human-returned" />
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
