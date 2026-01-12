import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { ISSUE_DESCRIPTIONS } from '@/constants/common';
import { IssueDescriptions, saveIssueDescriptions } from '@/types/smeConfig';
import { showToast } from '@/lib/toast';
import IssueDescriptionDialog from './IssueDescriptionDialog';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { createSMEIssueDescription, updateSMEIssueDescription, deleteSMEIssueDescription } from '../settingsApiCalls';

interface IssueDescriptionsSectionProps {
  issueDescriptions: IssueDescriptions;
  onUpdate: (issueDescriptions: IssueDescriptions) => void;
}

const IssueDescriptionsSection: React.FC<IssueDescriptionsSectionProps> = ({ issueDescriptions, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingDescription, setEditingDescription] = useState<{
    type: 'critical' | 'moderate' | 'minor';
    text: string;
    index?: number;
  } | null>(null);
  const [selectedToDelete, setSelectedToDelete] = useState<{
    type: 'critical' | 'moderate' | 'minor';
    index: number;
    text: string;
  } | null>(null);

  const handleAdd = () => {
    setEditingDescription(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (type: 'critical' | 'moderate' | 'minor', text: string, index: number) => {
    setEditingDescription({ type, text, index });
    setIsDialogOpen(true);
  };

  const handleSave = async (type: 'critical' | 'moderate' | 'minor', text: string) => {
    try {
      // TODO: Uncomment when APIs are ready
      // const updated = { ...issueDescriptions };
      // if (editingDescription) {
      //   const result = await updateSMEIssueDescription(editingDescription.type, editingDescription.index!, text);
      //   if (!result) return;
      //   updated[editingDescription.type][editingDescription.index!] = result;
      // } else {
      //   const result = await createSMEIssueDescription(type, text);
      //   if (!result) return;
      //   updated[type] = [...updated[type], result];
      // }
      // onUpdate(updated);

      // Using localStorage for now
      const updated = { ...issueDescriptions };
      if (editingDescription) {
        updated[editingDescription.type][editingDescription.index!] = text;
      } else {
        updated[type] = [...updated[type], text];
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

  const handleDeleteClick = (type: 'critical' | 'moderate' | 'minor', index: number) => {
    const text = issueDescriptions[type][index];
    setSelectedToDelete({ type, index, text });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedToDelete) return;

    setIsDeleting(true);
    try {
      // TODO: Uncomment when APIs are ready
      // const success = await deleteSMEIssueDescription(selectedToDelete.type, selectedToDelete.index);
      // if (!success) {
      //   setIsDeleting(false);
      //   return;
      // }
      // const updated = { ...issueDescriptions };
      // updated[selectedToDelete.type] = updated[selectedToDelete.type].filter((_, i) => i !== selectedToDelete.index);
      // onUpdate(updated);

      // Using localStorage for now
      const updated = { ...issueDescriptions };
      updated[selectedToDelete.type] = updated[selectedToDelete.type].filter((_, i) => i !== selectedToDelete.index);
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
          <div className="space-y-6">
            {(['critical', 'moderate', 'minor'] as const).map(type => (
              <div key={type}>
                <div className="mx-4 mb-2 flex items-center justify-between">
                  <h4 className="text-primary font-semibold capitalize">{type} Descriptions</h4>
                </div>
                <Card className="mx-4 gap-4 px-4 text-sm text-gray-600">
                  <p className="font-semibold">Default {type} descriptions:</p>
                  <ul className="ml-4 list-disc space-y-1">
                    {ISSUE_DESCRIPTIONS[type].map((desc, idx) => (
                      <li key={idx} className="text-xs">
                        {desc}
                      </li>
                    ))}
                  </ul>
                </Card>
                {issueDescriptions[type].length > 0 && (
                  <div className="mt-4">
                    <p className="text-primary mb-2 px-4 text-sm font-semibold">Custom {type} descriptions:</p>
                    <div className="border-y">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Description</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {issueDescriptions[type].map((desc, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{desc}</TableCell>
                                <TableCell>{type}</TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(type, desc, idx)} className="h-8 w-8 p-0">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteClick(type, idx)}
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
                  </div>
                )}
              </div>
            ))}
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
            ? `Are you sure you want to delete this ${selectedToDelete.type} issue description? This action cannot be undone.\n\n"${selectedToDelete.text.substring(0, 100)}${selectedToDelete.text.length > 100 ? '...' : ''}"`
            : 'Are you sure you want to delete this issue description? This action cannot be undone.'
        }
        confirmButtonText="Delete"
      />
    </>
  );
};

export default IssueDescriptionsSection;
