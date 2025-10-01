import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sword } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MatchupSelectorProps {
  teams: string[];
  onMatchupSelected: (team1: string, team2: string) => void;
}

export const MatchupSelector = ({ teams, onMatchupSelected }: MatchupSelectorProps) => {
  const [team1, setTeam1] = useState<string>("");
  const [team2, setTeam2] = useState<string>("");

  const handleAnalyze = () => {
    if (team1 && team2 && team1 !== team2) {
      onMatchupSelected(team1, team2);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sword className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold">Análise de Confronto Direto</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="team1">Time 1</Label>
          <Select value={team1} onValueChange={setTeam1}>
            <SelectTrigger id="team1" className="bg-background">
              <SelectValue placeholder="Selecione o time 1" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {teams.map((team) => (
                <SelectItem key={team} value={team} disabled={team === team2}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center text-2xl font-bold text-muted-foreground">
          VS
        </div>

        <div className="space-y-2">
          <Label htmlFor="team2">Time 2</Label>
          <Select value={team2} onValueChange={setTeam2}>
            <SelectTrigger id="team2" className="bg-background">
              <SelectValue placeholder="Selecione o time 2" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {teams.map((team) => (
                <SelectItem key={team} value={team} disabled={team === team1}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={!team1 || !team2 || team1 === team2}
        className="w-full mt-4 bg-primary hover:bg-primary/90"
      >
        Analisar Confronto
      </Button>
    </Card>
  );
};
