"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Game, Team } from "@/lib/database.types";
import { BuzzerButton } from "@/components/buzzer-button";
import { SoundPicker } from "@/components/sound-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Inner component that uses useSearchParams
function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Team info from session storage
  const [teamId, setTeamId] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  const [gameCode, setGameCode] = useState<string>("");

  // Game state
  const [game, setGame] = useState<Game | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const [buzzedTeamName, setBuzzedTeamName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from session storage
  useEffect(() => {
    const storedTeamId = sessionStorage.getItem("teamId");
    const storedTeamName = sessionStorage.getItem("teamName");
    const storedGameCode = sessionStorage.getItem("gameCode");
    const urlCode = searchParams.get("code");

    if (!storedTeamId || !storedTeamName || !storedGameCode) {
      // Not joined yet, redirect to join page
      router.push(urlCode ? `/join?code=${urlCode}` : "/join");
      return;
    }

    setTeamId(storedTeamId);
    setTeamName(storedTeamName);
    setGameCode(storedGameCode);
  }, [router, searchParams]);

  // Load initial game data and subscribe to updates
  useEffect(() => {
    if (!gameCode || !teamId) return;

    // Load game and team data
    const loadData = async () => {
      // Load game
      const { data: gameData } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameCode)
        .single();

      if (gameData) {
        setGame(gameData as Game);
      }

      // Load team data
      const { data: teamData } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      if (teamData) {
        setTeam(teamData as Team);
      }

      setIsLoading(false);
    };

    loadData();

    // Subscribe to game updates with status handling
    const channel = supabase
      .channel(`play:${gameCode}:${teamId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameCode}` },
        (payload) => {
          console.log("Game update received:", payload);
          const newGame = payload.new as Game;
          setGame(newGame);

          // Reset buzz state when question changes or buzzer is reset
          if (!newGame.active_question) {
            setHasBuzzed(false);
            setBuzzedTeamName(null);
          } else if (!newGame.active_question.buzzerLocked) {
            setHasBuzzed(false);
            setBuzzedTeamName(null);
          } else if (newGame.active_question.buzzedTeam) {
            setBuzzedTeamName(newGame.active_question.buzzedTeam.teamName);
            if (newGame.active_question.buzzedTeam.teamId === teamId) {
              setHasBuzzed(true);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "teams", filter: `id=eq.${teamId}` },
        (payload) => {
          console.log("Team update received:", payload);
          setTeam(payload.new as Team);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "buzzes", filter: `game_id=eq.${gameCode}` },
        (payload) => {
          console.log("Buzz received:", payload);
          const buzz = payload.new as { team_id: string; team_name: string };
          setBuzzedTeamName(buzz.team_name);
          if (buzz.team_id === teamId) {
            setHasBuzzed(true);
          }
        }
      )
      .subscribe((status, err) => {
        console.log("Subscription status:", status, err);
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to realtime updates");
        }
        if (err) {
          console.error("Subscription error:", err);
        }
      });

    // Fallback polling every 3 seconds in case realtime fails
    const pollInterval = setInterval(async () => {
      const { data: gameData } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameCode)
        .single();
      
      if (gameData) {
        setGame((prevGame) => {
          // Only update if something changed
          if (JSON.stringify(prevGame) !== JSON.stringify(gameData)) {
            console.log("Poll detected game change");
            return gameData as Game;
          }
          return prevGame;
        });
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [gameCode, teamId]);

  // Handle sound selection change
  const handleSoundChange = useCallback(async (soundType: string, customSound: string | null) => {
    if (!teamId) return;

    // Update team's sound preference in Supabase
    await supabase
      .from("teams")
      .update({ 
        sound_type: soundType, 
        custom_sound: customSound 
      })
      .eq("id", teamId);

    // Update local state
    setTeam((prev) => prev ? { ...prev, sound_type: soundType, custom_sound: customSound } : prev);
  }, [teamId]);

  // Handle ready toggle
  const handleReadyToggle = useCallback(async () => {
    if (!teamId || !team) return;

    const newReadyState = !team.ready;

    // Update ready status in Supabase
    await supabase
      .from("teams")
      .update({ ready: newReadyState })
      .eq("id", teamId);

    // Update local state
    setTeam((prev) => prev ? { ...prev, ready: newReadyState } : prev);
  }, [teamId, team]);

  // Handle buzz (sound plays on host, not here)
  const handleBuzz = useCallback(async () => {
    if (!game || !game.active_question || hasBuzzed || game.active_question.buzzerLocked) {
      return;
    }

    // Insert buzz record - host will play the sound
    const { error } = await supabase.from("buzzes").insert({
      game_id: gameCode,
      team_id: teamId,
      team_name: teamName,
      timestamp: Date.now(),
    });

    if (!error) {
      setHasBuzzed(true);
    }
  }, [game, gameCode, teamId, teamName, hasBuzzed]);

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-black rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Forbinder...</p>
        </div>
      </main>
    );
  }

  // Determine if buzzer should be enabled
  const buzzerDisabled = !game?.is_started || !game?.active_question;
  const buzzerLocked = game?.active_question?.buzzerLocked && !hasBuzzed;

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header with team info */}
      <header className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-xl font-bold text-black">{teamName}</h1>
            <p className="text-sm text-gray-500">Spil: {gameCode}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Point</p>
            <p className={`text-2xl font-bold ${(team?.score ?? 0) < 0 ? "text-red-600" : "text-black"}`}>
              {team?.score ?? 0} kr.
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
        {/* Waiting for game to start - show sound picker and ready button */}
        {!game?.is_started && (
          <div className="w-full max-w-md space-y-4">
            {/* Ready status card */}
            <Card className={`border-2 transition-all ${team?.ready ? "bg-green-50 border-green-500" : "bg-gray-50 border-gray-200"}`}>
              <CardContent className="py-6 text-center space-y-4">
                {team?.ready ? (
                  <>
                    <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                      <span className="text-3xl text-white">✓</span>
                    </div>
                    <p className="text-lg font-bold text-green-700">Du er klar!</p>
                    <p className="text-sm text-green-600">Venter på at vært starter spillet...</p>
                  </>
                ) : (
                  <>
                    <div className="animate-pulse mb-2">
                      <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto" />
                    </div>
                    <p className="text-lg text-gray-600">Tilpas din buzzer lyd nedenfor</p>
                    <p className="text-sm text-gray-400">Klik derefter på Klar når du er klar!</p>
                  </>
                )}
                
                {/* Ready/Not Ready button */}
                <Button
                  onClick={handleReadyToggle}
                  className={`w-full h-14 text-lg font-bold transition-all ${
                    team?.ready 
                      ? "bg-gray-500 hover:bg-gray-600 text-white" 
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {team?.ready ? "Annuller Klar" : "Jeg er klar!"}
                </Button>
              </CardContent>
            </Card>
            
            {/* Sound picker - only show when not ready */}
            {!team?.ready && (
              <SoundPicker
                selectedSound={team?.sound_type || "buzzer"}
                customSound={team?.custom_sound || null}
                onSoundChange={handleSoundChange}
              />
            )}
          </div>
        )}

        {/* Game started but no active question */}
        {game?.is_started && !game?.active_question && (
          <Card className="w-full max-w-sm bg-gray-50 border-gray-200">
            <CardContent className="py-8 text-center">
              <p className="text-lg text-gray-600">Venter på næste spørgsmål...</p>
              <p className="text-sm text-gray-400 mt-2">Gør dig klar til at buzze!</p>
            </CardContent>
          </Card>
        )}

        {/* Active question - show buzzer */}
        {game?.is_started && game?.active_question && (
          <div className="flex flex-col items-center space-y-6">
            {/* Question value */}
            <div className="text-center">
              <p className="text-sm text-gray-500">Spørgsmål for</p>
              <p className="text-3xl font-bold text-black">{game.active_question.value} kr.</p>
            </div>

            {/* Buzzer button */}
            <BuzzerButton
              onBuzz={handleBuzz}
              disabled={buzzerDisabled}
              hasBuzzed={hasBuzzed}
              isLocked={buzzerLocked ?? false}
            />

            {/* Status message */}
            {buzzedTeamName && !hasBuzzed && (
              <p className="text-lg text-gray-600">
                <span className="font-bold">{buzzedTeamName}</span> buzzede først!
              </p>
            )}
            {hasBuzzed && (
              <p className="text-lg text-green-600 font-bold">
                Du buzzede! Besvar spørgsmålet!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="p-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">Jeopardy! Quiz Spil</p>
      </footer>
    </main>
  );
}

// Play page - team buzzer interface
export default function PlayPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-black rounded-full" />
      </main>
    }>
      <PlayContent />
    </Suspense>
  );
}
