import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, Copy, Trash2, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePrograms, useDeleteProgram, useDuplicateProgram } from '@/hooks/usePrograms';

interface ProgramListProps {
  onCompare: (programIds: string[]) => void;
}

export function ProgramList({ onCompare }: ProgramListProps) {
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  
  const { data: programs = [], isLoading } = usePrograms();
  const deleteProgram = useDeleteProgram();
  const duplicateProgram = useDuplicateProgram();

  const handleDuplicate = (programId: string) => {
    duplicateProgram.mutate(programId);
  };

  const handleDelete = (programId: string) => {
    deleteProgram.mutate(programId);
  };

  const toggleProgramSelection = (programId: string) => {
    setSelectedPrograms(prev => {
      if (prev.includes(programId)) {
        return prev.filter(id => id !== programId);
      } else if (prev.length < 3) {
        return [...prev, programId];
      } else {
        // Toast would be handled by the hook, but we can add a simple alert here
        alert("You can only compare up to 3 programs at once");
        return prev;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading programs...</p>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Programs Yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first executive coaching program to start analyzing ROI.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedPrograms.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium">
              {selectedPrograms.length} program{selectedPrograms.length > 1 ? 's' : ''} selected
            </p>
            <p className="text-sm text-muted-foreground">
              Select up to 3 programs to compare
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedPrograms([])}
            >
              Clear
            </Button>
            <Button
              onClick={() => onCompare(selectedPrograms)}
              disabled={selectedPrograms.length < 2}
            >
              Compare ({selectedPrograms.length})
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {programs.map((program) => (
          <Card 
            key={program.id}
            className={`transition-colors cursor-pointer ${
              selectedPrograms.includes(program.id) 
                ? 'border-primary bg-primary/5' 
                : ''
            }`}
            onClick={() => toggleProgramSelection(program.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{program.name}</CardTitle>
                  <CardDescription>
                    {program.organization?.name} • {program.participants_count} participants
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {program.duration_months} months
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(program.id);
                      }}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(program.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cost per Participant</p>
                  <p className="font-medium">
                    ${program.cost_per_participant.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Investment</p>
                  <p className="font-medium">
                    ${((program.cost_per_participant * program.participants_count) + program.overhead_costs).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{program.duration_months} months</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}