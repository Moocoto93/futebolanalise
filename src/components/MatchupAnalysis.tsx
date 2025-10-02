import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target, Activity, Home, Plane, AlertCircle } from "lucide-react";
import { FootballMatch } from "@/utils/csvParser";

interface MatchupAnalysisProps {
  homeTeam: string;
  awayTeam: string;
  matches: FootballMatch[];
  lastNGames: number;
}

export const MatchupAnalysis = ({ homeTeam, awayTeam, matches, lastNGames }: MatchupAnalysisProps) => {
  // Filter matches: homeTeam playing at home, awayTeam playing away
  const homeTeamHomeMatches = matches
    .filter(m => m.HomeTeam === homeTeam)
    .slice(0, lastNGames);
  
  const awayTeamAwayMatches = matches
    .filter(m => m.AwayTeam === awayTeam)
    .slice(0, lastNGames);

  if (homeTeamHomeMatches.length === 0 || awayTeamAwayMatches.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Dados insuficientes</h3>
        <p className="text-muted-foreground">
          Não há dados suficientes para análise de {homeTeam} em casa ou {awayTeam} fora.
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

  const homeTeamStats = analyzeTeam(homeTeam, homeTeamHomeMatches);
  const awayTeamStats = analyzeTeam(awayTeam, awayTeamAwayMatches);

  // Generate predictions based on home/away patterns
  const predictions = [];
  
  // Goal prediction based on home team attacking at home and away team attacking away
  const predictedGoals = (parseFloat(homeTeamStats.avgHomeGoalsFor) + parseFloat(awayTeamStats.avgAwayGoalsAgainst)) / 2 +
                         (parseFloat(awayTeamStats.avgAwayGoalsFor) + parseFloat(homeTeamStats.avgHomeGoalsAgainst)) / 2;
  
  if (predictedGoals > 2.5) {
    predictions.push({
      title: "🔥 Expectativa de Muitos Gols",
      description: `Média prevista: ${predictedGoals.toFixed(2)} gols. ${homeTeam} marca ${homeTeamStats.avgHomeGoalsFor} em casa e ${awayTeam} marca ${awayTeamStats.avgAwayGoalsFor} fora.`,
      confidence: "Alta"
    });
  }

  // Both teams to score
  const bothScoreProb = (parseFloat(homeTeamStats.bothScoreRate) + parseFloat(awayTeamStats.bothScoreRate)) / 2;
  if (bothScoreProb > 50) {
    predictions.push({
      title: "⚽ Ambos Devem Marcar",
      description: `${homeTeam} marca em casa em ${(100 - parseFloat(homeTeamStats.failedToScoreRate)).toFixed(0)}% e ${awayTeam} fora em ${(100 - parseFloat(awayTeamStats.failedToScoreRate)).toFixed(0)}%.`,
      confidence: bothScoreProb > 65 ? "Alta" : "Média"
    });
  }

  // Win prediction using home/away win rates
  const homeTeamWinProb = parseFloat(homeTeamStats.homeWinRate);
  const awayTeamWinProb = parseFloat(awayTeamStats.awayWinRate);
  
  if (Math.abs(homeTeamWinProb - awayTeamWinProb) > 20) {
    const favorite = homeTeamWinProb > awayTeamWinProb ? homeTeam : awayTeam;
    const favoriteRate = Math.max(homeTeamWinProb, awayTeamWinProb);
    const location = homeTeamWinProb > awayTeamWinProb ? "em casa" : "fora";
    predictions.push({
      title: `🏆 ${favorite} é Favorito`,
      description: `${favorite} ${location} tem ${favoriteRate}% de vitórias contra ${Math.min(homeTeamWinProb, awayTeamWinProb)}% do adversário.`,
      confidence: Math.abs(homeTeamWinProb - awayTeamWinProb) > 30 ? "Alta" : "Média"
    });
  } else {
    predictions.push({
      title: "⚖️ Jogo Equilibrado",
      description: `${homeTeam} em casa (${homeTeamWinProb}% vitórias) vs ${awayTeam} fora (${awayTeamWinProb}% vitórias).`,
      confidence: "Média"
    });
  }

  // Defensive solidity
  if (parseFloat(homeTeamStats.cleanSheetRate) > 30 || parseFloat(awayTeamStats.cleanSheetRate) > 30) {
    const solidTeam = parseFloat(homeTeamStats.cleanSheetRate) > parseFloat(awayTeamStats.cleanSheetRate) ? homeTeam : awayTeam;
    const solidRate = Math.max(parseFloat(homeTeamStats.cleanSheetRate), parseFloat(awayTeamStats.cleanSheetRate));
    const location = solidTeam === homeTeam ? "em casa" : "fora";
    predictions.push({
      title: `🛡️ ${solidTeam} Tem Defesa Sólida`,
      description: `${solidTeam} ${location} mantém a defesa intacta em ${solidRate.toFixed(0)}% dos jogos analisados.`,
      confidence: solidRate > 40 ? "Alta" : "Média"
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <Home className="w-6 h-6 text-primary" />
            {homeTeam} <span className="text-muted-foreground">vs</span> {awayTeam}
            <Plane className="w-6 h-6 text-secondary" />
          </h2>
          <p className="text-muted-foreground">
            Análise baseada nos últimos {lastNGames} jogos: {homeTeam} em casa ({homeTeamStats.totalGames} jogos) e {awayTeam} fora ({awayTeamStats.totalGames} jogos)
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
        {/* Home Team Stats */}
        <Card className="p-6 border-primary/20">
          <h3 className="text-lg font-bold mb-4 text-primary flex items-center gap-2">
            <Home className="w-5 h-5" />
            {homeTeam} (Casa)
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vitórias em Casa</span>
              <span className="font-bold">{homeTeamStats.homeWinRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Resultados</span>
              <span className="font-bold">{homeTeamStats.wins}V {homeTeamStats.draws}E {homeTeamStats.losses}D</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gols em Casa</span>
              <span className="font-bold">{homeTeamStats.avgHomeGoalsFor} por jogo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gols Sofridos em Casa</span>
              <span className="font-bold">{homeTeamStats.avgHomeGoalsAgainst} por jogo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clean Sheets</span>
              <span className="font-bold">{homeTeamStats.cleanSheetRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Over 2.5</span>
              <span className="font-bold">{homeTeamStats.over25Rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ambos Marcam</span>
              <span className="font-bold">{homeTeamStats.bothScoreRate}%</span>
            </div>
          </div>
        </Card>

        {/* Away Team Stats */}
        <Card className="p-6 border-secondary/20">
          <h3 className="text-lg font-bold mb-4 text-secondary flex items-center gap-2">
            <Plane className="w-5 h-5" />
            {awayTeam} (Fora)
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vitórias Fora</span>
              <span className="font-bold">{awayTeamStats.awayWinRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Resultados</span>
              <span className="font-bold">{awayTeamStats.wins}V {awayTeamStats.draws}E {awayTeamStats.losses}D</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gols Fora</span>
              <span className="font-bold">{awayTeamStats.avgAwayGoalsFor} por jogo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gols Sofridos Fora</span>
              <span className="font-bold">{awayTeamStats.avgAwayGoalsAgainst} por jogo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clean Sheets</span>
              <span className="font-bold">{awayTeamStats.cleanSheetRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Over 2.5</span>
              <span className="font-bold">{awayTeamStats.over25Rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ambos Marcam</span>
              <span className="font-bold">{awayTeamStats.bothScoreRate}%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
