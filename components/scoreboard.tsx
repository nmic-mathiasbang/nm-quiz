"use client";

import { Team } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Props for the Scoreboard component
interface ScoreboardProps {
  teams: Team[];
  highlightTeamId?: string;  // Team that just buzzed
}

// Displays all team scores
export function Scoreboard({ teams, highlightTeamId }: ScoreboardProps) {
  // Sort teams by score (highest first)
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-black">Scoreboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedTeams.length === 0 ? (
          <p className="text-gray-500 text-sm">No teams yet</p>
        ) : (
          sortedTeams.map((team, index) => (
            <div
              key={team.id}
              className={`
                flex items-center justify-between p-3 rounded-lg
                transition-all duration-300
                ${highlightTeamId === team.id 
                  ? 'bg-red-100 border-2 border-red-500 scale-105' 
                  : 'bg-gray-50 border border-gray-200'
                }
                ${!team.connected ? 'opacity-50' : ''}
              `}
            >
              <div className="flex items-center gap-2">
                {/* Rank badge */}
                <Badge 
                  variant={index === 0 ? "default" : "secondary"}
                  className={index === 0 ? "bg-black text-white" : ""}
                >
                  #{index + 1}
                </Badge>
                
                {/* Team name */}
                <span className="font-medium text-black">{team.name}</span>
                
                {/* Disconnected indicator */}
                {!team.connected && (
                  <Badge variant="outline" className="text-xs text-gray-500">
                    Offline
                  </Badge>
                )}
              </div>
              
              {/* Score */}
              <span className={`font-bold text-lg ${team.score < 0 ? 'text-red-600' : 'text-black'}`}>
                ${team.score}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
