import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trophy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface League {
  id: string;
  name: string;
  country: string;
  flag: string;
}

export const LEAGUES: League[] = [
  { id: "E0", name: "Premier League", country: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "SP1", name: "La Liga", country: "Espanha", flag: "🇪🇸" },
  { id: "I1", name: "Serie A", country: "Itália", flag: "🇮🇹" },
  { id: "D1", name: "Bundesliga", country: "Alemanha", flag: "🇩🇪" },
  { id: "P1", name: "Primeira Liga", country: "Portugal", flag: "🇵🇹" },
];

interface LeagueSelectorProps {
  selectedLeague: string;
  onLeagueChange: (leagueId: string) => void;
}

export const LeagueSelector = ({ selectedLeague, onLeagueChange }: LeagueSelectorProps) => {
  const currentLeague = LEAGUES.find(l => l.id === selectedLeague);

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Selecionar Liga</h3>
          <p className="text-sm text-muted-foreground">Escolha a competição para análise</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="league">Liga</Label>
        <Select value={selectedLeague} onValueChange={onLeagueChange}>
          <SelectTrigger id="league" className="bg-background h-12">
            <SelectValue>
              {currentLeague && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentLeague.flag}</span>
                  <div className="text-left">
                    <p className="font-bold">{currentLeague.name}</p>
                    <p className="text-xs text-muted-foreground">{currentLeague.country}</p>
                  </div>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {LEAGUES.map((league) => (
              <SelectItem key={league.id} value={league.id}>
                <div className="flex items-center gap-3 py-1">
                  <span className="text-2xl">{league.flag}</span>
                  <div>
                    <p className="font-bold">{league.name}</p>
                    <p className="text-xs text-muted-foreground">{league.country}</p>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};
