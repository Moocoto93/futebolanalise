export interface FootballMatch {
  Div: string;
  Date: string;
  Time: string;
  HomeTeam: string;
  AwayTeam: string;
  FTHG: number; // Full Time Home Goals
  FTAG: number; // Full Time Away Goals
  FTR: string;  // Full Time Result (H=Home Win, D=Draw, A=Away Win)
  HTHG: number; // Half Time Home Goals
  HTAG: number; // Half Time Away Goals
  HTR: string;  // Half Time Result
}

export const parseCSV = async (url: string): Promise<FootballMatch[]> => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      console.error('CSV file is empty or invalid');
      return [];
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('CSV Headers:', headers);
    
    const matches: FootballMatch[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const match: any = {};
      
      headers.forEach((header, index) => {
        match[header] = values[index]?.trim() || '';
      });
      
      // Validate required fields
      if (!match.HomeTeam || !match.AwayTeam) {
        continue;
      }
      
      // Convert numeric fields safely
      match.FTHG = parseInt(match.FTHG) || 0;
      match.FTAG = parseInt(match.FTAG) || 0;
      match.HTHG = parseInt(match.HTHG) || 0;
      match.HTAG = parseInt(match.HTAG) || 0;
      
      matches.push(match as FootballMatch);
    }
    
    console.log(`Parsed ${matches.length} matches`);
    if (matches.length > 0) {
      console.log('Sample match:', matches[0]);
    }
    
    return matches;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
};

export const analyzePatterns = (matches: FootballMatch[]) => {
  const totalMatches = matches.length;
  const homeWins = matches.filter(m => m.FTR === 'H').length;
  const draws = matches.filter(m => m.FTR === 'D').length;
  const awayWins = matches.filter(m => m.FTR === 'A').length;
  
  const totalGoals = matches.reduce((sum, m) => sum + m.FTHG + m.FTAG, 0);
  const avgGoals = (totalGoals / totalMatches).toFixed(2);
  
  const over25 = matches.filter(m => (m.FTHG + m.FTAG) > 2.5).length;
  const over25Percentage = ((over25 / totalMatches) * 100).toFixed(1);
  
  const bothTeamsScore = matches.filter(m => m.FTHG > 0 && m.FTAG > 0).length;
  const btsPercentage = ((bothTeamsScore / totalMatches) * 100).toFixed(1);
  
  return {
    totalMatches,
    homeWins,
    draws,
    awayWins,
    avgGoals,
    over25Percentage,
    btsPercentage,
    homeWinPercentage: ((homeWins / totalMatches) * 100).toFixed(1),
    drawPercentage: ((draws / totalMatches) * 100).toFixed(1),
    awayWinPercentage: ((awayWins / totalMatches) * 100).toFixed(1),
  };
};

export const getTeamStats = (matches: FootballMatch[]) => {
  const teamStats: Record<string, { wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number }> = {};
  
  matches.forEach(match => {
    // Home team
    if (!teamStats[match.HomeTeam]) {
      teamStats[match.HomeTeam] = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
    }
    teamStats[match.HomeTeam].goalsFor += match.FTHG;
    teamStats[match.HomeTeam].goalsAgainst += match.FTAG;
    if (match.FTR === 'H') teamStats[match.HomeTeam].wins++;
    else if (match.FTR === 'D') teamStats[match.HomeTeam].draws++;
    else teamStats[match.HomeTeam].losses++;
    
    // Away team
    if (!teamStats[match.AwayTeam]) {
      teamStats[match.AwayTeam] = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
    }
    teamStats[match.AwayTeam].goalsFor += match.FTAG;
    teamStats[match.AwayTeam].goalsAgainst += match.FTHG;
    if (match.FTR === 'A') teamStats[match.AwayTeam].wins++;
    else if (match.FTR === 'D') teamStats[match.AwayTeam].draws++;
    else teamStats[match.AwayTeam].losses++;
  });
  
  return Object.entries(teamStats)
    .map(([name, stats]) => ({
      name,
      vitórias: stats.wins,
      empates: stats.draws,
      derrotas: stats.losses,
      golsPro: stats.goalsFor,
      golsContra: stats.goalsAgainst,
    }))
    .sort((a, b) => (b.vitórias * 3 + b.empates) - (a.vitórias * 3 + a.empates))
    .slice(0, 8);
};
