"use client";

import { Team } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Props for the HostControls component
interface HostControlsProps {
  teams: Team[];
  isGameStarted: boolean;
  onStartGame: () => void;
  onAwardPoints: (teamId: string, points: number) => void;
}

// Host control panel for managing the game
export function HostControls({
  teams,
  isGameStarted,
  onStartGame,
  onAwardPoints,
}: HostControlsProps) {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-black">Host Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Start game button */}
        {!isGameStarted && (
          <Button
            onClick={onStartGame}
            disabled={teams.length < 2}
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            {teams.length < 2 
              ? `Need ${2 - teams.length} more team(s)` 
              : 'Start Game'
            }
          </Button>
        )}

        {/* Manual score adjustment */}
        {isGameStarted && teams.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Manual Score Adjustment:</p>
            {teams.map((team) => (
              <div key={team.id} className="flex items-center gap-2">
                <span className="flex-1 text-sm font-medium text-black truncate">
                  {team.name}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAwardPoints(team.id, -100)}
                  className="border-gray-300 text-black hover:bg-gray-100"
                >
                  -100
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAwardPoints(team.id, 100)}
                  className="border-gray-300 text-black hover:bg-gray-100"
                >
                  +100
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
