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
  onEndGame?: () => void;  // Optional end game handler
}

// Host control panel for managing the game
export function HostControls({
  teams,
  isGameStarted,
  onStartGame,
  onAwardPoints,
  onEndGame,
}: HostControlsProps) {
  // Check if all teams are ready
  const allTeamsReady = teams.length > 0 && teams.every(t => t.ready);
  const readyCount = teams.filter(t => t.ready).length;

  // Determine button state and message
  const getStartButtonState = () => {
    if (teams.length < 1) {
      return { disabled: true, message: "Waiting for teams..." };
    }
    if (!allTeamsReady) {
      return { 
        disabled: true, 
        message: `Waiting for ${teams.length - readyCount} team${teams.length - readyCount !== 1 ? "s" : ""} to ready up` 
      };
    }
    return { disabled: false, message: "Start Game" };
  };

  const buttonState = getStartButtonState();

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
            disabled={buttonState.disabled}
            className={`w-full ${
              allTeamsReady 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-gray-400 text-white"
            }`}
          >
            {buttonState.message}
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

        {/* End game button */}
        {onEndGame && (
          <Button
            onClick={onEndGame}
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            End Game
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
