"use client";

import { Team } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Props for the TeamList component
interface TeamListProps {
  teams: Team[];
  showReadyStatus?: boolean;  // Show ready status in waiting lobby
}

// Displays connected teams (for lobby/waiting room)
export function TeamList({ teams, showReadyStatus = false }: TeamListProps) {
  const readyCount = teams.filter(t => t.ready).length;
  const allReady = teams.length > 0 && readyCount === teams.length;

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-black flex items-center justify-between">
          <span>Teams ({teams.length})</span>
          {showReadyStatus && teams.length > 0 && (
            <span className={`text-sm font-normal ${allReady ? "text-green-600" : "text-gray-500"}`}>
              {readyCount}/{teams.length} ready
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teams.length === 0 ? (
          <p className="text-gray-500 text-sm">Waiting for teams to join...</p>
        ) : (
          <div className="space-y-2">
            {teams.map((team) => (
              <div
                key={team.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${!team.connected 
                    ? 'bg-gray-100 border-gray-200 opacity-50' 
                    : team.ready 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-gray-50 border-gray-200'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  {/* Ready indicator */}
                  {showReadyStatus && (
                    <span className={`text-lg ${team.ready ? "text-green-600" : "text-gray-400"}`}>
                      {team.ready ? "✓" : "○"}
                    </span>
                  )}
                  
                  {/* Team name */}
                  <span className="font-medium text-black">{team.name}</span>
                  
                  {/* Offline indicator */}
                  {!team.connected && (
                    <Badge variant="outline" className="text-xs text-gray-500">
                      offline
                    </Badge>
                  )}
                </div>

                {/* Ready status badge */}
                {showReadyStatus && (
                  <Badge
                    variant={team.ready ? "default" : "outline"}
                    className={
                      team.ready 
                        ? "bg-green-600 text-white" 
                        : "bg-gray-100 text-gray-500"
                    }
                  >
                    {team.ready ? "Ready" : "Picking sound..."}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
