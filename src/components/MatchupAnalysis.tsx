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
  // Analyze ALL matches for each team
  const team1Matches = matches.filter(m => m.HomeTeam === team1 || m.AwayTeam === team1);
  const team2Matches = matches.filter(m => m.HomeTeam === team2 || m.AwayTeam === team2);

  if (team1Matches.length === 0 || team2Matches.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Dados insuficientes</h3>
        <p className="text-muted-foreground">
          Não há dados suficientes para análise de {team1} ou {team2}.
        </p>
      </Card>
    );
  }

  // Analyze Team 1
  const analyzeTeam = (teamName: string, teamMatches: FootballMatch[]) => {
    let wins = 0, draws = 0, losses = 0;
    let goalsFor = 0, goalsAgainst = 0;
    let homeWins = 0, awayWins = 0;
    let homeGF = 0, awayGF = 0, homeGA = 0, awayGA = 0;
    let cleanSheets = 0, failedToScore = 0;
    let over25Games = 0, bothScoreGames = 0;

    teamMatches.forEach(match => {
      const isHome = match.HomeTeam === teamName;
      const gf = isHome ? match.FTHG : match.FTAG;
      const ga = isHome ? match.FTAG : match.FTHG;
      
      goalsFor += gf;
      goalsAgainst += ga;
      
      if (isHome) {
        homeGF += gf;
        homeGA += ga;
      } else {
        awayGF += gf;
        awayGA += ga;
      }

      if (gf > ga) {
        wins++;
        if (isHome) homeWins++;
        else awayWins++;
      } else if (gf === ga) {
        draws++;
      } else {
        losses++;
      }

      if (ga === 0) cleanSheets++;
      if (gf === 0) failedToScore++;
      if ((gf + ga) > 2.5) over25Games++;
      if (gf > 0 && ga > 0) bothScoreGames++;
    });

    const totalGames = teamMatches.length;
    const homeGames = teamMatches.filter(m => m.HomeTeam === teamName).length;
    const awayGames = teamMatches.filter(m => m.AwayTeam === teamName).length;

    return {
      wins, draws, losses,
      winRate: ((wins / totalGames) * 100).toFixed(0),
      avgGoalsFor: (goalsFor / totalGames).toFixed(2),
      avgGoalsAgainst: (goalsAgainst / totalGames).toFixed(2),
      homeWinRate: homeGames > 0 ? ((homeWins / homeGames) * 100).toFixed(0) : "0",
      awayWinRate: awayGames > 0 ? ((awayWins / awayGames) * 100).toFixed(0) : "0",
      avgHomeGoalsFor: homeGames > 0 ? (homeGF / homeGames).toFixed(2) : "0",
      avgAwayGoalsFor: awayGames > 0 ? (awayGF / awayGames).toFixed(2) : "0",
      avgHomeGoalsAgainst: homeGames > 0 ? (homeGA / homeGames).toFixed(2) : "0",
      avgAwayGoalsAgainst: awayGames > 0 ? (awayGA / awayGames).toFixed(2) : "0",
      cleanSheetRate: ((cleanSheets / totalGames) * 100).toFixed(0),
      failedToScoreRate: ((failedToScore / totalGames) * 100).toFixed(0),
      over25Rate: ((over25Games / totalGames) * 100).toFixed(0),
      bothScoreRate: ((bothScoreGames / totalGames) * 100).toFixed(0),
      totalGames,
    };
  };

  const team1Stats = analyzeTeam(team1, team1Matches);
  const team2Stats = analyzeTeam(team2, team2Matches);

  // Generate predictions based on patterns
  const predictions = [];
  
  // Goal prediction
  const predictedGoals = (parseFloat(team1Stats.avgGoalsFor) + parseFloat(team2Stats.avgGoalsAgainst)) / 2 +
                         (parseFloat(team2Stats.avgGoalsFor) + parseFloat(team1Stats.avgGoalsAgainst)) / 2;
  
  if (predictedGoals > 2.5) {
    predictions.push({
      title: "🔥 Expectativa de Muitos Gols",
      description: `Média prevista: ${predictedGoals.toFixed(2)} gols. ${team1} marca ${team1Stats.avgGoalsFor} e ${team2} marca ${team2Stats.avgGoalsFor} por jogo.`,
      confidence: "Alta"
    });
  }

  // Both teams to score
  const bothScoreProb = (parseFloat(team1Stats.bothScoreRate) + parseFloat(team2Stats.bothScoreRate)) / 2;
  if (bothScoreProb > 50) {
    predictions.push({
      title: "⚽ Ambos Devem Marcar",
      description: `${team1} marca em ${(100 - parseFloat(team1Stats.failedToScoreRate)).toFixed(0)}% dos jogos e ${team2} em ${(100 - parseFloat(team2Stats.failedToScoreRate)).toFixed(0)}%.`,
      confidence: bothScoreProb > 65 ? "Alta" : "Média"
    });
  }

  // Win prediction (considering it's neutral ground analysis)
  const team1WinProb = parseFloat(team1Stats.winRate);
  const team2WinProb = parseFloat(team2Stats.winRate);
  
  if (Math.abs(team1WinProb - team2WinProb) > 20) {
    const favorite = team1WinProb > team2WinProb ? team1 : team2;
    const favoriteRate = Math.max(team1WinProb, team2WinProb);
    predictions.push({
      title: `🏆 ${favorite} é Favorito`,
      description: `${favorite} tem ${favoriteRate}% de aproveitamento contra ${Math.min(team1WinProb, team2WinProb)}% do adversário.`,
      confidence: Math.abs(team1WinProb - team2WinProb) > 30 ? "Alta" : "Média"
    });
  } else {
    predictions.push({
      title: "⚖️ Jogo Equilibrado",
      description: `Ambos times têm aproveitamento similar: ${team1} (${team1WinProb}%) vs ${team2} (${team2WinProb}%).`,
      confidence: "Média"
    });
  }

  // Defensive solidity
  if (parseFloat(team1Stats.cleanSheetRate) > 30 || parseFloat(team2Stats.cleanSheetRate) > 30) {
    const solidTeam = parseFloat(team1Stats.cleanSheetRate) > parseFloat(team2Stats.cleanSheetRate) ? team1 : team2;
    const solidRate = Math.max(parseFloat(team1Stats.cleanSheetRate), parseFloat(team2Stats.cleanSheetRate));
    predictions.push({
      title: `🛡️ ${solidTeam} Tem Defesa Sólida`,
      description: `${solidTeam} mantém a defesa intacta em ${solidRate.toFixed(0)}% dos jogos.`,
      confidence: solidRate > 40 ? "Alta" : "Média"
    });
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
            Análise baseada em {team1Stats.totalGames} jogos de {team1} e {team2Stats.totalGames} de {team2}
          </p>
        </div>
      </Card>

      {/* Predictions */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Previsões Baseadas em Padrões
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {predictions.map((pred, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-card border-2 border-primary/20 hover:border-primary/40 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-bold text-lg">{pred.title}</p>
                <Badge variant={pred.confidence === "Alta" ? "default" : "secondary"}>
                  {pred.confidence}
                </Badge>
              </div>
              <p className="text-muted-foreground">{pred.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Team Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 Stats */}
        <Card className="p-6 border-primary/20">
          <h3 className="text-lg font-bold mb-4 text-primary">{team1}</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aproveitamento</span>
              <span className="font-bold">{team1Stats.winRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vitórias</span>
              <span className="font-bold">{team1Stats.wins}V {team1Stats.draws}E {team1Stats.losses}D</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gols por Jogo</span>
              <span className="font-bold">{team1Stats.avgGoalsFor} marcados</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gols Sofridos</span>
              <span className="font-bold">{team1Stats.avgGoalsAgainst} por jogo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clean Sheets</span>
              <span className="font-bold">{team1Stats.cleanSheetRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Over 2.5</span>
              <span className="font-bold">{team1Stats.over25Rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ambos Marcam</span>
              <span className="font-bold">{team1Stats.bothScoreRate}%</span>
            </div>
          </div>
        </Card>

        {/* Team 2 Stats */}
        <Card className="p-6 border-secondary/20">
          <h3 className="text-lg font-bold mb-4 text-secondary">{team2}</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aproveitamento</span>
              <span className="font-bold">{team2Stats.winRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vitórias</span>
              <span className="font-bold">{team2Stats.wins}V {team2Stats.draws}E {team2Stats.losses}D</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gols por Jogo</span>
              <span className="font-bold">{team2Stats.avgGoalsFor} marcados</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gols Sofridos</span>
              <span className="font-bold">{team2Stats.avgGoalsAgainst} por jogo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clean Sheets</span>
              <span className="font-bold">{team2Stats.cleanSheetRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Over 2.5</span>
              <span className="font-bold">{team2Stats.over25Rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ambos Marcam</span>
              <span className="font-bold">{team2Stats.bothScoreRate}%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
