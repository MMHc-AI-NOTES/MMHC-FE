import React from 'react';
import { Info } from 'lucide-react';

const ImportantGuidelinesSection: React.FC = () => {
  return (
    <div className="rounded-lg bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Info className="text-primary h-5 w-5" />
        <h3 className="text-primary font-semibold">Important Guidelines</h3>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Privacy & Compliance</h4>
          <ul className="list-inside space-y-1 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="bg-primary-light mt-1.5 h-1 w-1 shrink-0 rounded-full" />
              <span>Ensure all PHI (Protected Health Information) is removed before submission</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary-light mt-1.5 h-1 w-1 shrink-0 rounded-full" />
              <span>This tool is not intended for collecting PII or securing sensitive patient data</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Audit Process</h4>
          <ul className="list-inside space-y-1 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="bg-primary-light mt-1.5 h-1 w-1 shrink-0 rounded-full" />
              <span>The AI will evaluate quality, compliance, medical necessity, and session specificity</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary-light mt-1.5 h-1 w-1 shrink-0 rounded-full" />
              <span>Results will include a compliance score, identified issues, and recommendations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary-light mt-1.5 h-1 w-1 shrink-0 rounded-full" />
              <span>Notes scoring below 75 will be automatically flagged for human review</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImportantGuidelinesSection;
