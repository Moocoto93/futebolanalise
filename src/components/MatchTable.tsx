import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export interface Match {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

interface MatchTableProps {
  matches: Match[];
}

export const MatchTable = ({ matches }: MatchTableProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold">Data</TableHead>
              <TableHead className="font-bold">Casa</TableHead>
              <TableHead className="text-center font-bold">Placar</TableHead>
              <TableHead className="font-bold">Visitante</TableHead>
              <TableHead className="text-center font-bold">Resultado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.slice(0, 10).map((match, index) => {
              const result = match.homeScore > match.awayScore ? 'V' : match.homeScore < match.awayScore ? 'D' : 'E';
              const resultColor = result === 'V' ? 'text-primary' : result === 'D' ? 'text-destructive' : 'text-muted-foreground';
              
              return (
                <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{match.date}</TableCell>
                  <TableCell className="font-semibold">{match.homeTeam}</TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-lg">
                      {match.homeScore} - {match.awayScore}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">{match.awayTeam}</TableCell>
                  <TableCell className="text-center">
                    <span className={`font-bold ${resultColor}`}>{result}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
