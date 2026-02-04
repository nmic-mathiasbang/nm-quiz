"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, generateTeamId } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Inner component that uses useSearchParams
function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Form state
  const [gameCode, setGameCode] = useState(searchParams.get("code") || "");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Handle form submission
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!gameCode.trim()) {
      setError("Please enter a game code");
      return;
    }

    if (!teamName.trim()) {
      setError("Please enter a team name");
      return;
    }

    if (teamName.length > 20) {
      setError("Team name must be 20 characters or less");
      return;
    }

    setIsJoining(true);

    try {
      const code = gameCode.trim().toUpperCase();

      // Check if game exists
      const { data: game, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("id", code)
        .single();

      if (gameError || !game) {
        setError("Game not found. Check your game code.");
        setIsJoining(false);
        return;
      }

      // Check if team name is already taken in this game
      const { data: existingTeam } = await supabase
        .from("teams")
        .select("*")
        .eq("game_id", code)
        .eq("name", teamName.trim())
        .single();

      if (existingTeam) {
        setError("Team name already taken. Choose another name.");
        setIsJoining(false);
        return;
      }

      // Generate team ID and create team
      const teamId = generateTeamId();
      
      const { error: insertError } = await supabase.from("teams").insert({
        id: teamId,
        game_id: code,
        name: teamName.trim(),
        score: 0,
        connected: true,
        sound_type: "buzzer",    // Default buzzer sound
        custom_sound: null,
        ready: false,            // Not ready until they click ready
      });

      if (insertError) {
        setError("Failed to join game. Please try again.");
        setIsJoining(false);
        return;
      }

      // Store team info in session storage
      sessionStorage.setItem("teamId", teamId);
      sessionStorage.setItem("teamName", teamName.trim());
      sessionStorage.setItem("gameCode", code);

      // Navigate to play page
      router.push(`/play?code=${code}`);
    } catch (err) {
      console.error("Join error:", err);
      setError("Something went wrong. Please try again.");
      setIsJoining(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-white border-gray-200">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-black">Join Game</CardTitle>
        <CardDescription className="text-gray-600">
          Enter the game code and your team name
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Join form */}
        <form onSubmit={handleJoin} className="space-y-4">
          {/* Game code input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Game Code
            </label>
            <Input
              type="text"
              placeholder="ABC123"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              disabled={isJoining}
              className="h-14 text-xl text-center tracking-widest font-mono border-gray-300 focus:border-black focus:ring-black uppercase"
              maxLength={6}
            />
          </div>

          {/* Team name input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <Input
              type="text"
              placeholder="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={isJoining}
              className="h-14 text-lg text-center border-gray-300 focus:border-black focus:ring-black"
              maxLength={20}
              autoFocus={!!gameCode}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isJoining || !teamName.trim() || !gameCode.trim()}
            className="w-full h-14 text-lg bg-black text-white hover:bg-gray-800"
          >
            {isJoining ? "Joining..." : "Join Game"}
          </Button>
        </form>

        {/* Back link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-black text-sm underline"
          >
            Back to Home
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// Join page - team enters game code and their name to join
export default function JoinPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-black rounded-full mx-auto" />
        </div>
      }>
        <JoinForm />
      </Suspense>
    </main>
  );
}
