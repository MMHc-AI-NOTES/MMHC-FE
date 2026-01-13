import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { ISSUE_DESCRIPTIONS } from '@/constants/common';
import { IssueDescriptions, saveIssueDescriptions } from '@/types/smeConfig';
import { showToast } from '@/lib/toast';
import IssueDescriptionDialog from './IssueDescriptionDialog';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
// import { createSMEIssueDescription, updateSMEIssueDescription, deleteSMEIssueDescription } from '../settingsApiCalls';

interface IssueDescriptionsSectionProps {
  issueDescriptions: IssueDescriptions;
  onUpdate: (issueDescriptions: IssueDescriptions) => void;
}

const IssueDescriptionsSection: React.FC<IssueDescriptionsSectionProps> = ({ issueDescriptions, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingDescription, setEditingDescription] = useState<{ text: string; index?: number } | null>(null);
  const [selectedToDelete, setSelectedToDelete] = useState<{ index: number; text: string } | null>(null);

  const handleAdd = () => {
    setEditingDescription(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (text: string, index: number) => {
    setEditingDescription({ text, index });
    setIsDialogOpen(true);
  };

  const handleSave = async (text: string) => {
    try {
      // TODO: Uncomment when APIs are ready
      // if (editingDescription) {
      //   const result = await updateSMEIssueDescription(editingDescription.index!, text);
      //   if (!result) return;
      //   const updated = [...issueDescriptions];
      //   updated[editingDescription.index!] = result;
      //   onUpdate(updated);
      // } else {
      //   const result = await createSMEIssueDescription(text);
      //   if (!result) return;
      //   onUpdate([...issueDescriptions, result]);
      // }

      // Using localStorage for now
      const updated = [...issueDescriptions];
      if (editingDescription) {
        updated[editingDescription.index!] = text;
      } else {
        updated.push(text);
      }
      saveIssueDescriptions(updated);
      onUpdate(updated);
      setIsDialogOpen(false);
      setEditingDescription(null);
      showToast.success(editingDescription ? 'Issue description updated successfully' : 'Issue description added successfully');
    } catch (error) {
      console.error('Error saving issue description:', error);
      showToast.error('Failed to save issue description');
    }
  };

  const handleDeleteClick = (index: number) => {
    const text = issueDescriptions[index];
    setSelectedToDelete({ index, text });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedToDelete) return;

    setIsDeleting(true);
    try {
      // TODO: Uncomment when APIs are ready
      // const success = await deleteSMEIssueDescription(selectedToDelete.index);
      // if (!success) {
      //   setIsDeleting(false);
      //   return;
      // }
      // onUpdate(issueDescriptions.filter((_, i) => i !== selectedToDelete.index));

      // Using localStorage for now
      const updated = issueDescriptions.filter((_, i) => i !== selectedToDelete.index);
      saveIssueDescriptions(updated);
      onUpdate(updated);
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedToDelete(null);
      showToast.success('Issue description deleted successfully');
    } catch (error) {
      console.error('Error deleting issue description:', error);
      showToast.error('Failed to delete issue description');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <CardTitle className="text-primary text-lg font-semibold">Issue Descriptions</CardTitle>
            <Button onClick={handleAdd} className="bg-gradient-light text-primary border-0 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Issue Description
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-y">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-3 text-left">Description</TableHead>
                    {issueDescriptions.length > 0 && <TableHead className="w-[15%]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Default Descriptions */}
                  {ISSUE_DESCRIPTIONS.map((desc, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-left">{desc}</TableCell>
                      {issueDescriptions.length > 0 && <TableCell></TableCell>}
                    </TableRow>
                  ))}
                  {/* Custom Descriptions */}
                  {issueDescriptions.map((desc, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-left">{desc}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(desc, idx)} className="h-8 w-8 p-0">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(idx)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <IssueDescriptionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        editingDescription={editingDescription}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        isLoading={isDeleting}
        onOpenChange={open => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setSelectedToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Issue Description"
        description={
          selectedToDelete
            ? `Are you sure you want to delete this issue description? This action cannot be undone.\n\n"${selectedToDelete.text.substring(0, 100)}${selectedToDelete.text.length > 100 ? '...' : ''}"`
            : 'Are you sure you want to delete this issue description? This action cannot be undone.'
        }
        confirmButtonText="Delete"
      />
    </>
  );
};

export default IssueDescriptionsSection;
