import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Bot, RotateCcw } from 'lucide-react';
import moment from 'moment';
import { Chat } from '@/types/notes';

interface AuditHistoryCardProps {
  chats: Chat[];
}

const AuditHistoryCard = ({ chats }: AuditHistoryCardProps) => {
  // Sort chats by date (newest first)
  const sortedChats = [...chats].sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf());

  const getScoreStatus = (score: number): { label: string; className: string } => {
    if (score >= 95) {
      return {
        label: 'PASS',
        className: 'bg-green-100 text-green-700 hover:bg-green-100',
      };
    }
    return {
      label: 'FAIL',
      className: 'bg-red-100 text-red-700 hover:bg-red-100',
    };
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <History className="h-5 w-5" />
          Audit History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedChats.length > 0 ? (
          sortedChats.map((chat, index) => {
            const bedrockResponse = chat.bedrockResponse;
            const score = bedrockResponse?.score || 0;
            const scoreStatus = getScoreStatus(score);
            const formattedDate = moment(chat.createdAt).format('MMM D, YYYY — h:mm A');

            return (
              <div key={chat.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                      <Bot className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">AI Audit Run</h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                        <span>Score: {score}/100</span>
                        <span>({scoreStatus.label})</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formattedDate}</span>
                </div>

                {index < sortedChats.length - 1 && <div className="border-t border-gray-200" />}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <RotateCcw className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No audit history available</p>
            <p className="mt-1 text-xs text-gray-400">Run an audit to see the history</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditHistoryCard;
