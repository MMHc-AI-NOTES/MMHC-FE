import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchNoteFromAirtable } from './notesFetchFromAirtableApiCalls';
import type { NoteDetailFromAirtable } from './notesFetchFromAirtableApiCalls';
import { Loader2 } from 'lucide-react';

const NotesFetchFromAirtable = () => {
  const [noteId, setNoteId] = useState('');
  const [detail, setDetail] = useState<NoteDetailFromAirtable | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    const id = noteId.trim();
    if (!id) return;

    setLoading(true);
    setError(null);
    setDetail(null);

    try {
      const data = await fetchNoteFromAirtable(id);
      setDetail(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch note details';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>Notes Fetch from Airtable</CardTitle>
          <p className="text-muted-foreground text-sm">Enter a note ID and click Fetch to load details from Airtable.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note-id">Note ID</Label>
            <Input
              id="note-id"
              placeholder="Enter note ID"
              value={noteId}
              onChange={e => setNoteId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              disabled={loading}
            />
          </div>
          <Button onClick={handleFetch} disabled={loading || !noteId.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching…
              </>
            ) : (
              'Fetch'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {detail !== null && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Note details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted max-h-[60vh] overflow-auto rounded-md p-4 text-sm">{JSON.stringify(detail, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotesFetchFromAirtable;
