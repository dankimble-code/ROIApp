import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { Program, Organization } from '@/types/coaching';
import { useToast } from '@/hooks/use-toast';

interface ProgramListProps {
  onCompare: (programIds: string[]) => void;
}

export function ProgramList({ onCompare }: ProgramListProps) {
  const [programs, setPrograms] = useState<(Program & { organization: Organization })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          organization:organizations(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast({
        title: "Error",
        description: "Failed to load programs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (program: Program) => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .insert({
          organization_id: program.organization_id,
          name: `${program.name} (Copy)`,
          duration_months: program.duration_months,
          participants_count: program.participants_count,
          cost_per_participant: program.cost_per_participant,
          overhead_costs: program.overhead_costs,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Program duplicated successfully"
      });
      
      fetchPrograms();
    } catch (error) {
      console.error('Error duplicating program:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate program",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (programId: string) => {
    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', programId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Program deleted successfully"
      });
      
      fetchPrograms();
    } catch (error) {
      console.error('Error deleting program:', error);
      toast({
        title: "Error",
        description: "Failed to delete program",
        variant: "destructive"
      });
    }
  };

  const toggleProgramSelection = (programId: string) => {
    setSelectedPrograms(prev => {
      if (prev.includes(programId)) {
        return prev.filter(id => id !== programId);
      } else if (prev.length < 3) {
        return [...prev, programId];
      } else {
        toast({
          title: "Limit Reached",
          description: "You can only compare up to 3 programs at once",
          variant: "destructive"
        });
        return prev;
      }
    });
  };

  if (loading) {
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
                        handleDuplicate(program);
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