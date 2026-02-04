"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Props for the ConnectionInfo component
interface ConnectionInfoProps {
  gameId: string;
}

// Displays connection information for players to join
export function ConnectionInfo({ gameId }: ConnectionInfoProps) {
  // Get the current URL for sharing
  const gameUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/join?code=${gameId}`
    : "";

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-black">Join the Game</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game code - big and prominent */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Game Code:</p>
          <p className="text-4xl font-mono font-bold text-black tracking-widest bg-white p-4 rounded-lg border border-gray-200 text-center">
            {gameId}
          </p>
        </div>

        {/* URL for direct access */}
        {gameUrl && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Or share this link:</p>
            <p className="text-sm font-mono text-gray-700 bg-white p-3 rounded-lg border border-gray-200 break-all">
              {gameUrl}
            </p>
          </div>
        )}

        {/* Instructions */}
        <p className="text-sm text-gray-500">
          Players can go to the website and enter the game code to join.
        </p>
      </CardContent>
    </Card>
  );
}
