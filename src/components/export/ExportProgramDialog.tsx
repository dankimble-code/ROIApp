import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FileDown } from 'lucide-react';

interface Program {
  id: string;
  name: string;
  organization?: { name: string } | null;
}

interface ExportProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programs: Program[];
  onExport: (programIds: string[]) => void;
  isExporting?: boolean;
}

export function ExportProgramDialog({
  open,
  onOpenChange,
  programs,
  onExport,
  isExporting = false,
}: ExportProgramDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allSelected = selectedIds.length === programs.length && programs.length > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(programs.map((p) => p.id));
    }
  };

  const toggleProgram = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    onExport(selectedIds);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export PDF Report</DialogTitle>
          <DialogDescription>
            Select which programs to include in the exported report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4 max-h-[300px] overflow-y-auto">
          {/* Select All */}
          <div className="flex items-center space-x-3 pb-2 border-b">
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={toggleAll}
            />
            <Label htmlFor="select-all" className="font-semibold cursor-pointer">
              Select All ({programs.length} programs)
            </Label>
          </div>

          {/* Individual programs */}
          {programs.map((program) => (
            <div key={program.id} className="flex items-center space-x-3">
              <Checkbox
                id={`program-${program.id}`}
                checked={selectedIds.includes(program.id)}
                onCheckedChange={() => toggleProgram(program.id)}
              />
              <Label htmlFor={`program-${program.id}`} className="cursor-pointer flex-1">
                <span className="font-medium">{program.name}</span>
                {program.organization?.name && (
                  <span className="text-muted-foreground text-sm ml-2">
                    — {program.organization.name}
                  </span>
                )}
              </Label>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedIds.length === 0 || isExporting}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {isExporting
              ? 'Exporting...'
              : `Export ${selectedIds.length === 1 ? '1 Program' : `${selectedIds.length} Programs`}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
