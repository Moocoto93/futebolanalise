import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TeamSelectorProps {
  teams: string[];
  selectedTeams: string[];
  onSelectionChange: (teams: string[]) => void;
}

export const TeamSelector = ({ teams, selectedTeams, onSelectionChange }: TeamSelectorProps) => {
  const [open, setOpen] = useState(false);

  console.log('TeamSelector - teams:', teams);
  console.log('TeamSelector - selectedTeams:', selectedTeams);

  const toggleTeam = (team: string) => {
    if (selectedTeams.includes(team)) {
      onSelectionChange(selectedTeams.filter(t => t !== team));
    } else {
      onSelectionChange([...selectedTeams, team]);
    }
  };

  const selectAll = () => {
    onSelectionChange(teams);
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">Filtrar por Times</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAll}
            className="h-7 text-xs"
          >
            Todos
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-7 text-xs"
          >
            Limpar
          </Button>
        </div>
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selectedTeams.length === 0
                ? "Selecione os times..."
                : selectedTeams.length === teams.length
                ? "Todos os times"
                : `${selectedTeams.length} time(s) selecionado(s)`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover z-50" align="start">
          <ScrollArea className="h-[300px] bg-popover">
            <div className="p-2 space-y-1">
              {teams.map((team) => (
                <div
                  key={team}
                  className={cn(
                    "flex items-center space-x-2 rounded-md px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
                    selectedTeams.includes(team) && "bg-accent/50"
                  )}
                  onClick={() => toggleTeam(team)}
                >
                  <Checkbox
                    checked={selectedTeams.includes(team)}
                    onCheckedChange={() => toggleTeam(team)}
                    className="pointer-events-none"
                  />
                  <label className="text-sm font-medium cursor-pointer flex-1">
                    {team}
                  </label>
                  {selectedTeams.includes(team) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {selectedTeams.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {selectedTeams.slice(0, 3).map((team) => (
            <span
              key={team}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-xs font-medium"
            >
              {team}
            </span>
          ))}
          {selectedTeams.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium">
              +{selectedTeams.length - 3} mais
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
