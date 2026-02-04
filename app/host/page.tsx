"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, generateGameCode, generateTeamId } from "@/lib/supabase";
import type { Game, Team, ActiveQuestion, Category, BuzzEvent } from "@/lib/database.types";
import { GameBoard } from "@/components/game-board";
import { Scoreboard } from "@/components/scoreboard";
import { TeamList } from "@/components/team-list";
import { QuestionModal } from "@/components/question-modal";
import { HostControls } from "@/components/host-controls";
import { ConnectionInfo } from "@/components/connection-info";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import { playTeamBuzzer } from "@/lib/buzzer-sounds";
import questionsData from "@/data/questions.json";

// Host page - displays game board and controls
export default function HostPage() {
  // Game state
  const [gameId, setGameId] = useState<string | null>(null);
  const [hostId, setHostId] = useState<string>("");
  const [game, setGame] = useState<Game | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [buzzedTeamId, setBuzzedTeamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize game on mount
  useEffect(() => {
    const initGame = async () => {
      // Generate unique IDs
      const newGameId = generateGameCode();
      const newHostId = generateTeamId();
      
      // Prepare categories with 'used' property
      const categories: Category[] = questionsData.categories.map(cat => ({
        ...cat,
        questions: cat.questions.map(q => ({ ...q, used: false }))
      }));

      // Create game in Supabase
      const { error } = await supabase.from("games").insert({
        id: newGameId,
        host_id: newHostId,
        is_started: false,
        categories: categories,
        active_question: null,
        show_answer: false,
      });

      if (error) {
        console.error("Failed to create game:", error);
        return;
      }

      setGameId(newGameId);
      setHostId(newHostId);
      setGame({
        id: newGameId,
        host_id: newHostId,
        is_started: false,
        categories: categories,
        active_question: null,
        show_answer: false,
      });
      setIsLoading(false);
    };

    initGame();
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!gameId) return;

    // Subscribe to game updates
    const gameChannel = supabase
      .channel(`game:${gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const newGame = payload.new as Game;
            setGame(newGame);
            setShowAnswer(newGame.show_answer);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams", filter: `game_id=eq.${gameId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTeams((prev) => [...prev, payload.new as Team]);
          } else if (payload.eventType === "UPDATE") {
            setTeams((prev) =>
              prev.map((t) => (t.id === (payload.new as Team).id ? (payload.new as Team) : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTeams((prev) => prev.filter((t) => t.id !== (payload.old as Team).id));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "buzzes", filter: `game_id=eq.${gameId}` },
        async (payload) => {
          const buzz = payload.new as { team_id: string; team_name: string; timestamp: number };
          setBuzzedTeamId(buzz.team_id);
          
          // Find the team that buzzed and play their custom sound
          setTeams((currentTeams) => {
            const buzzedTeam = currentTeams.find((t) => t.id === buzz.team_id);
            if (buzzedTeam) {
              playTeamBuzzer(buzzedTeam);
            }
            return currentTeams;
          });
          
          // Update active question with buzz info
          setGame((prev) => {
            if (!prev || !prev.active_question) return prev;
            return {
              ...prev,
              active_question: {
                ...prev.active_question,
                buzzedTeam: {
                  teamId: buzz.team_id,
                  teamName: buzz.team_name,
                  timestamp: buzz.timestamp,
                },
                buzzerLocked: true,
              },
            };
          });
        }
      )
      .subscribe();

    // Load existing teams
    const loadTeams = async () => {
      const { data } = await supabase
        .from("teams")
        .select("*")
        .eq("game_id", gameId);
      if (data) setTeams(data);
    };
    loadTeams();

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [gameId]);

  // Host actions
  const handleStartGame = useCallback(async () => {
    if (!gameId) return;
    await supabase.from("games").update({ is_started: true }).eq("id", gameId);
    setGame((prev) => (prev ? { ...prev, is_started: true } : prev));
  }, [gameId]);

  const handleSelectQuestion = useCallback(
    async (categoryIndex: number, questionIndex: number) => {
      if (!game || !gameId) return;

      const category = game.categories[categoryIndex];
      const question = category.questions[questionIndex];
      if (question.used) return;

      const activeQuestion: ActiveQuestion = {
        categoryIndex,
        questionIndex,
        question: question.question,
        answer: question.answer,
        value: question.value,
        buzzedTeam: null,
        buzzerLocked: false,
      };

      // Clear previous buzzes for this question
      await supabase.from("buzzes").delete().eq("game_id", gameId);

      await supabase
        .from("games")
        .update({ active_question: activeQuestion, show_answer: false })
        .eq("id", gameId);

      setGame((prev) => (prev ? { ...prev, active_question: activeQuestion } : prev));
      setShowAnswer(false);
      setBuzzedTeamId(null);
    },
    [game, gameId]
  );

  const handleRevealAnswer = useCallback(async () => {
    if (!gameId) return;
    await supabase.from("games").update({ show_answer: true }).eq("id", gameId);
    setShowAnswer(true);
  }, [gameId]);

  const handleAwardPoints = useCallback(
    async (teamId: string, points: number) => {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return;

      const newScore = team.score + points;
      await supabase.from("teams").update({ score: newScore }).eq("id", teamId);

      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, score: newScore } : t))
      );

      // Play sound effect
      if (points > 0) {
        playCorrectSound();
      } else {
        playWrongSound();
      }
    },
    [teams]
  );

  const handleResetBuzzer = useCallback(async () => {
    if (!game || !gameId || !game.active_question) return;

    // Clear buzzes
    await supabase.from("buzzes").delete().eq("game_id", gameId);

    // Update active question to unlock buzzer
    const updatedQuestion: ActiveQuestion = {
      ...game.active_question,
      buzzedTeam: null,
      buzzerLocked: false,
    };

    await supabase
      .from("games")
      .update({ active_question: updatedQuestion })
      .eq("id", gameId);

    setGame((prev) => (prev ? { ...prev, active_question: updatedQuestion } : prev));
    setBuzzedTeamId(null);
  }, [game, gameId]);

  const handleCloseQuestion = useCallback(async () => {
    if (!game || !gameId || !game.active_question) return;

    const { categoryIndex, questionIndex } = game.active_question;

    // Mark question as used
    const updatedCategories = [...game.categories];
    updatedCategories[categoryIndex].questions[questionIndex].used = true;

    await supabase
      .from("games")
      .update({ 
        categories: updatedCategories, 
        active_question: null, 
        show_answer: false 
      })
      .eq("id", gameId);

    // Clear buzzes
    await supabase.from("buzzes").delete().eq("game_id", gameId);

    setGame((prev) =>
      prev ? { ...prev, categories: updatedCategories, active_question: null, show_answer: false } : prev
    );
    setShowAnswer(false);
    setBuzzedTeamId(null);
  }, [game, gameId]);

  // Loading state
  if (isLoading || !game) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-black rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Creating game...</p>
        </div>
      </main>
    );
  }

  // Pre-game lobby view
  if (!game.is_started) {
    return (
      <main className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header - only in lobby */}
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-black">Jeopardy!</h1>
            <p className="text-gray-500 text-sm mt-1">Game: {gameId}</p>
          </header>

          {/* Pre-game: Show connection info and waiting for teams */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <ConnectionInfo gameId={gameId!} />
            <div className="space-y-4">
              <TeamList teams={teams} showReadyStatus={true} />
              <HostControls
                teams={teams}
                isGameStarted={game.is_started}
                onStartGame={handleStartGame}
                onAwardPoints={handleAwardPoints}
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Full-screen game view
  return (
    <main className="h-screen bg-white flex">
      {/* Game board - full screen */}
      <div className="flex-1 p-4">
        <GameBoard
          categories={game.categories}
          onSelectQuestion={handleSelectQuestion}
          disabled={!!game.active_question}
        />
      </div>

      {/* Sidebar */}
      <div className="w-80 p-4 border-l border-gray-200 flex flex-col gap-4 overflow-auto">
        <Scoreboard teams={teams} highlightTeamId={buzzedTeamId ?? undefined} />
        <HostControls
          teams={teams}
          isGameStarted={game.is_started}
          onStartGame={handleStartGame}
          onAwardPoints={handleAwardPoints}
        />
      </div>

      {/* Question modal */}
      <QuestionModal
        question={game.active_question}
        teams={teams}
        showAnswer={showAnswer}
        isHost={true}
        onRevealAnswer={handleRevealAnswer}
        onAwardPoints={handleAwardPoints}
        onResetBuzzer={handleResetBuzzer}
        onClose={handleCloseQuestion}
      />
    </main>
  );
}
