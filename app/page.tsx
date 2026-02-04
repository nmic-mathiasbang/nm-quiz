"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Landing page - choose to be host or join with game code
export default function HomePage() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Handle joining a game with code
  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameCode.trim()) {
      setError("Please enter a game code");
      return;
    }

    // Navigate to join page with game code
    router.push(`/join?code=${gameCode.trim().toUpperCase()}`);
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-black">Jeopardy!</CardTitle>
          <CardDescription className="text-gray-600">
            A real-time quiz game for teams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Host button */}
          <Button
            onClick={() => router.push("/host")}
            className="w-full h-16 text-lg bg-black text-white hover:bg-gray-800"
          >
            Host a Game
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or join a game</span>
            </div>
          </div>

          {/* Join with game code */}
          <form onSubmit={handleJoinWithCode} className="space-y-3">
            <Input
              type="text"
              placeholder="Enter Game Code"
              value={gameCode}
              onChange={(e) => {
                setGameCode(e.target.value.toUpperCase());
                setError(null);
              }}
              className="h-14 text-lg text-center tracking-widest font-mono border-gray-300 focus:border-black focus:ring-black uppercase"
              maxLength={6}
            />
            
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              variant="outline"
              className="w-full h-14 text-lg border-gray-300 text-black hover:bg-gray-100"
            >
              Join Game
            </Button>
          </form>

          {/* Instructions */}
          <div className="pt-2 text-center text-sm text-gray-500">
            <p className="mb-2">
              <strong>Host:</strong> Display the game board on a large screen
            </p>
            <p>
              <strong>Team:</strong> Enter the code shown on the host&apos;s screen
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
