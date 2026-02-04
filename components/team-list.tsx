"use client";

import { Team } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Props for the TeamList component
interface TeamListProps {
  teams: Team[];
}

// Displays connected teams (for lobby/waiting room)
export function TeamList({ teams }: TeamListProps) {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-black">
          Teams ({teams.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teams.length === 0 ? (
          <p className="text-gray-500 text-sm">Waiting for teams to join...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => (
              <Badge
                key={team.id}
                variant={team.connected ? "default" : "outline"}
                className={`
                  py-2 px-3 text-sm
                  ${team.connected 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-500'
                  }
                `}
              >
                {team.name}
                {!team.connected && " (offline)"}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
