import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target, Activity, Home, Plane, AlertCircle } from "lucide-react";
import { FootballMatch } from "@/utils/csvParser";

interface MatchupAnalysisProps {
  team1: string;
  team2: string;
  matches: FootballMatch[];
}

export const MatchupAnalysis = ({ team1, team2, matches }: MatchupAnalysisProps) => {
  // Filter direct confrontations
  const headToHead = matches.filter(
    (m) =>
      (m.HomeTeam === team1 && m.AwayTeam === team2) ||
      (m.HomeTeam === team2 && m.AwayTeam === team1)
  );

  if (headToHead.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum confronto encontrado</h3>
        <p className="text-muted-foreground">
          Não há dados de confrontos diretos entre {team1} e {team2} nesta temporada.
        </p>
      </Card>
    );
  }

  // Calculate statistics
  let team1Wins = 0;
  let team2Wins = 0;
  let draws = 0;
  let team1Goals = 0;
  let team2Goals = 0;
  let team1HomeWins = 0;
  let team2HomeWins = 0;
  let over25 = 0;
  let bothScore = 0;

  headToHead.forEach((match) => {
    const isTeam1Home = match.HomeTeam === team1;
    const team1Score = isTeam1Home ? match.FTHG : match.FTAG;
    const team2Score = isTeam1Home ? match.FTAG : match.FTHG;

    team1Goals += team1Score;
    team2Goals += team2Score;

    if (team1Score > team2Score) {
      team1Wins++;
      if (isTeam1Home) team1HomeWins++;
    } else if (team2Score > team1Score) {
      team2Wins++;
      if (!isTeam1Home) team2HomeWins++;
    } else {
      draws++;
    }

    if (team1Score + team2Score > 2.5) over25++;
    if (team1Score > 0 && team2Score > 0) bothScore++;
  });

  const totalMatches = headToHead.length;
  const avgGoals = ((team1Goals + team2Goals) / totalMatches).toFixed(2);
  const over25Percentage = ((over25 / totalMatches) * 100).toFixed(0);
  const bothScorePercentage = ((bothScore / totalMatches) * 100).toFixed(0);

  // Identify patterns
  const patterns = [];
  if (over25 / totalMatches >= 0.7) {
    patterns.push("🔥 Alto padrão de gols - Mais de 2.5 gols em " + over25Percentage + "% dos jogos");
  }
  if (bothScore / totalMatches >= 0.7) {
    patterns.push("⚽ Ambos marcam frequentemente - " + bothScorePercentage + "% dos confrontos");
  }
  if (team1HomeWins / team1Wins >= 0.7 && team1Wins > 0) {
    patterns.push("🏠 " + team1 + " domina em casa contra " + team2);
  }
  if (team2HomeWins / team2Wins >= 0.7 && team2Wins > 0) {
    patterns.push("🏠 " + team2 + " domina em casa contra " + team1);
  }
  if (draws / totalMatches >= 0.4) {
    patterns.push("🤝 Confronto equilibrado - " + ((draws / totalMatches) * 100).toFixed(0) + "% de empates");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            {team1} <span className="text-muted-foreground">vs</span> {team2}
          </h2>
          <p className="text-muted-foreground">
            {totalMatches} confronto{totalMatches > 1 ? 's' : ''} direto{totalMatches > 1 ? 's' : ''}
          </p>
        </div>
      </Card>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center bg-primary/5 border-primary/20">
          <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-1">Vitórias {team1}</p>
          <p className="text-3xl font-bold text-primary">{team1Wins}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {((team1Wins / totalMatches) * 100).toFixed(0)}%
          </p>
        </Card>

        <Card className="p-6 text-center">
          <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-1">Empates</p>
          <p className="text-3xl font-bold">{draws}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {((draws / totalMatches) * 100).toFixed(0)}%
          </p>
        </Card>

        <Card className="p-6 text-center bg-secondary/5 border-secondary/20">
          <Trophy className="w-8 h-8 text-secondary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-1">Vitórias {team2}</p>
          <p className="text-3xl font-bold text-secondary">{team2Wins}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {((team2Wins / totalMatches) * 100).toFixed(0)}%
          </p>
        </Card>
      </div>

      {/* Goals Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <Target className="w-6 h-6 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Média de Gols</p>
          <p className="text-2xl font-bold">{avgGoals}</p>
        </Card>

        <Card className="p-4">
          <TrendingUp className="w-6 h-6 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Over 2.5</p>
          <p className="text-2xl font-bold">{over25Percentage}%</p>
        </Card>

        <Card className="p-4">
          <Activity className="w-6 h-6 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Ambos Marcam</p>
          <p className="text-2xl font-bold">{bothScorePercentage}%</p>
        </Card>

        <Card className="p-4">
          <Trophy className="w-6 h-6 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Total Gols</p>
          <p className="text-2xl font-bold">{team1Goals + team2Goals}</p>
        </Card>
      </div>

      {/* Patterns */}
      {patterns.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Padrões Identificados
          </h3>
          <div className="space-y-3">
            {patterns.map((pattern, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-primary/5 border border-primary/20"
              >
                <p className="font-medium">{pattern}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Matches */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Últimos Confrontos</h3>
        <div className="space-y-3">
          {headToHead.slice(0, 5).map((match, index) => {
            const isTeam1Home = match.HomeTeam === team1;
            const homeTeam = isTeam1Home ? team1 : team2;
            const awayTeam = isTeam1Home ? team2 : team1;
            const result = match.FTR;
            const winnerColor =
              result === "H"
                ? isTeam1Home
                  ? "text-primary"
                  : "text-secondary"
                : result === "A"
                ? isTeam1Home
                  ? "text-secondary"
                  : "text-primary"
                : "text-muted-foreground";

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{homeTeam}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`font-bold ${winnerColor}`}>
                    {match.FTHG} - {match.FTAG}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="font-semibold">{awayTeam}</span>
                  <Plane className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
