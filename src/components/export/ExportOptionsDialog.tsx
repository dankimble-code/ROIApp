import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileDown, ListChecks, Files } from 'lucide-react';

interface ExportOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showCurrentOption?: boolean;
  currentProgramName?: string;
  onExportCurrent?: () => void;
  onSelectPrograms: () => void;
  onExportAll: () => void;
  programCount: number;
  isExporting?: boolean;
}

export function ExportOptionsDialog({
  open,
  onOpenChange,
  showCurrentOption = false,
  currentProgramName,
  onExportCurrent,
  onSelectPrograms,
  onExportAll,
  programCount,
  isExporting = false,
}: ExportOptionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Choose how you'd like to export your ROI report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Option 1: Export Current Report */}
          {showCurrentOption && onExportCurrent && (
            <button
              onClick={() => {
                onExportCurrent();
                onOpenChange(false);
              }}
              disabled={isExporting}
              className="w-full flex items-start gap-4 rounded-lg border border-border p-4 text-left hover:bg-accent/50 transition-colors disabled:opacity-50"
            >
              <FileDown className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-sm">Export Current Report</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Export the ROI report for{' '}
                  <span className="font-medium">{currentProgramName || 'this program'}</span> as a PDF.
                </p>
              </div>
            </button>
          )}

          {/* Option 2: Select Reports */}
          <button
            onClick={() => {
              onSelectPrograms();
              onOpenChange(false);
            }}
            disabled={isExporting || programCount === 0}
            className="w-full flex items-start gap-4 rounded-lg border border-border p-4 text-left hover:bg-accent/50 transition-colors disabled:opacity-50"
          >
            <ListChecks className="h-5 w-5 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">Select Reports to Export</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose specific programs to include in a comparison report.
              </p>
            </div>
          </button>

          {/* Option 3: Export All */}
          <button
            onClick={() => {
              onExportAll();
              onOpenChange(false);
            }}
            disabled={isExporting || programCount === 0}
            className="w-full flex items-start gap-4 rounded-lg border border-border p-4 text-left hover:bg-accent/50 transition-colors disabled:opacity-50"
          >
            <Files className="h-5 w-5 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">Export All Reports</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Export all {programCount} program{programCount !== 1 ? 's' : ''} in your account as a comparison report.
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
