import { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchNoteFromAirtable } from './notesFetchFromAirtableApiCalls';
import type { NoteDetailFromAirtable } from './notesFetchFromAirtableApiCalls';
import { Loader2 } from 'lucide-react';
import InputField from '@/shared/InputField';

interface FormValues {
  noteId: string;
}

const validationSchema = yup.object({
  noteId: yup.string().trim().required('Note ID is required').min(1, 'Note ID cannot be empty'),
});

const NotesFetchFromAirtable = () => {
  const [detail, setDetail] = useState<NoteDetailFromAirtable | null>(null);

  const formik = useFormik<FormValues>({
    initialValues: {
      noteId: '',
    },
    validationSchema,
    onSubmit: async values => {
      const id = values.noteId.trim();
      if (!id) return;
      const data = await fetchNoteFromAirtable(id);
      setDetail(data);
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>Notes Fetch from Airtable</CardTitle>
          <p className="text-muted-foreground text-sm">Enter a note ID and click Fetch to load details from Airtable.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <InputField id="noteId" label="Note ID" placeholder="Enter note ID" formik={formik} disabled={formik.isSubmitting} />
            <div className="flex justify-end">
              <Button type="submit" disabled={formik.isSubmitting} className="w-28">
                {formik.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Fetch'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {detail !== null && (
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
