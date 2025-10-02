import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sword, Home, Plane } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MatchupSelectorProps {
  teams: string[];
  onMatchupSelected: (homeTeam: string, awayTeam: string, lastNGames: number) => void;
}

export const MatchupSelector = ({ teams, onMatchupSelected }: MatchupSelectorProps) => {
  const [team1, setTeam1] = useState<string>("");
  const [team2, setTeam2] = useState<string>("");
  const [homeAway, setHomeAway] = useState<"1home" | "2home">("1home");
  const [lastNGames, setLastNGames] = useState<string>("5");

  const handleAnalyze = () => {
    if (team1 && team2 && team1 !== team2) {
      const homeTeam = homeAway === "1home" ? team1 : team2;
      const awayTeam = homeAway === "1home" ? team2 : team1;
      onMatchupSelected(homeTeam, awayTeam, parseInt(lastNGames));
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label>Situação Casa/Fora</Label>
          <RadioGroup value={homeAway} onValueChange={(value) => setHomeAway(value as "1home" | "2home")}>
            <div className="flex items-center space-x-2 p-3 rounded-lg border bg-card">
              <RadioGroupItem value="1home" id="1home" />
              <Label htmlFor="1home" className="flex items-center gap-2 cursor-pointer flex-1">
                <Home className="w-4 h-4 text-primary" />
                <span>{team1 || "Time 1"} em Casa</span>
                <span className="text-muted-foreground">vs</span>
                <Plane className="w-4 h-4 text-secondary" />
                <span>{team2 || "Time 2"} Fora</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border bg-card">
              <RadioGroupItem value="2home" id="2home" />
              <Label htmlFor="2home" className="flex items-center gap-2 cursor-pointer flex-1">
                <Plane className="w-4 h-4 text-secondary" />
                <span>{team1 || "Time 1"} Fora</span>
                <span className="text-muted-foreground">vs</span>
                <Home className="w-4 h-4 text-primary" />
                <span>{team2 || "Time 2"} em Casa</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastNGames">Quantidade de Jogos para Análise</Label>
          <Select value={lastNGames} onValueChange={setLastNGames}>
            <SelectTrigger id="lastNGames" className="bg-background">
              <SelectValue placeholder="Selecione a quantidade" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="3">Últimos 3 jogos</SelectItem>
              <SelectItem value="5">Últimos 5 jogos</SelectItem>
              <SelectItem value="7">Últimos 7 jogos</SelectItem>
              <SelectItem value="9">Últimos 9 jogos</SelectItem>
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
