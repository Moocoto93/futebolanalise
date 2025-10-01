import { useEffect, useState, useMemo } from "react";
import { Trophy, TrendingUp, Target, Activity } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { MatchTable, Match } from "@/components/MatchTable";
import { PatternChart } from "@/components/PatternChart";
import { TeamSelector } from "@/components/TeamSelector";
import { parseCSV, analyzePatterns, getTeamStats, FootballMatch } from "@/utils/csvParser";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [matches, setMatches] = useState<FootballMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await parseCSV("/data/E0.csv");
        
        if (data.length === 0) {
          toast({
            title: "Aviso",
            description: "Nenhum dado foi carregado. Pode haver um problema de CORS ou o arquivo está vazio.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        setMatches(data);
        
        // Get unique teams and select all by default
        const uniqueTeams = Array.from(
          new Set([...data.map(m => m.HomeTeam), ...data.map(m => m.AwayTeam)])
        ).filter(Boolean).sort();
        
        setSelectedTeams(uniqueTeams);
        
        toast({
          title: "Dados carregados!",
          description: `${data.length} jogos e ${uniqueTeams.length} times encontrados.`,
        });
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados de futebol. Verifique o console para mais detalhes.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get all unique teams
  const allTeams = useMemo(() => {
    const teams = new Set<string>();
    matches.forEach(m => {
      if (m.HomeTeam) teams.add(m.HomeTeam);
      if (m.AwayTeam) teams.add(m.AwayTeam);
    });
    return Array.from(teams).sort();
  }, [matches]);

  // Filter matches by selected teams
  const filteredMatches = useMemo(() => {
    if (selectedTeams.length === 0) return matches;
    return matches.filter(m => 
      selectedTeams.includes(m.HomeTeam) || selectedTeams.includes(m.AwayTeam)
    );
  }, [matches, selectedTeams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const stats = analyzePatterns(filteredMatches);
  const teamStats = getTeamStats(filteredMatches);
  const recentMatches: Match[] = filteredMatches.slice(0, 10).map(m => ({
    date: m.Date,
    homeTeam: m.HomeTeam,
    awayTeam: m.AwayTeam,
    homeScore: m.FTHG,
    awayScore: m.FTAG,
  }));

  const resultDistribution = [
    {
      name: "Resultados",
      vitórias: parseInt(stats.homeWinPercentage),
      empates: parseInt(stats.drawPercentage),
      derrotas: parseInt(stats.awayWinPercentage),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Análise de Padrões - Premier League</h1>
              <p className="text-sm text-muted-foreground">Temporada 2025/26</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Team Selector */}
        <section>
          <TeamSelector
            teams={allTeams}
            selectedTeams={selectedTeams}
            onSelectionChange={setSelectedTeams}
          />
        </section>

        {/* Stats Overview */}
        <section>
          <h2 className="text-xl font-bold mb-4">Estatísticas Gerais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total de Jogos"
              value={stats.totalMatches}
              icon={Activity}
              variant="primary"
            />
            <StatsCard
              title="Média de Gols"
              value={stats.avgGoals}
              icon={Target}
              trend="por jogo"
              variant="secondary"
            />
            <StatsCard
              title="Over 2.5 Gols"
              value={`${stats.over25Percentage}%`}
              icon={TrendingUp}
              trend="dos jogos"
            />
            <StatsCard
              title="Ambos Marcam"
              value={`${stats.btsPercentage}%`}
              icon={Trophy}
              trend="dos jogos"
            />
          </div>
        </section>

        {/* Patterns */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PatternChart
            title="Distribuição de Resultados"
            data={resultDistribution}
          />
          <PatternChart
            title="Desempenho por Time (Top 8)"
            data={teamStats}
          />
        </section>

        {/* Recent Matches */}
        <section>
          <h2 className="text-xl font-bold mb-4">Últimos Jogos</h2>
          <MatchTable matches={recentMatches} />
        </section>

        {/* Insights */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-lg bg-primary/10 border border-primary/20">
              <h3 className="font-bold text-lg mb-2">Vitórias em Casa</h3>
              <p className="text-3xl font-bold text-primary">{stats.homeWinPercentage}%</p>
              <p className="text-sm text-muted-foreground mt-2">Vantagem do mandante</p>
            </div>
            <div className="p-6 rounded-lg bg-muted/50 border border-border">
              <h3 className="font-bold text-lg mb-2">Empates</h3>
              <p className="text-3xl font-bold">{stats.drawPercentage}%</p>
              <p className="text-sm text-muted-foreground mt-2">Jogos equilibrados</p>
            </div>
            <div className="p-6 rounded-lg bg-secondary/10 border border-secondary/20">
              <h3 className="font-bold text-lg mb-2">Vitórias Fora</h3>
              <p className="text-3xl font-bold text-secondary">{stats.awayWinPercentage}%</p>
              <p className="text-sm text-muted-foreground mt-2">Força do visitante</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
