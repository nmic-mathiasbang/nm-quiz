// Database types for the Jeopardy game

// Game types
export interface Question {
  value: number;
  question: string;
  answer: string;
  used: boolean;
}

export interface Category {
  name: string;
  questions: Question[];
}

export interface ActiveQuestion {
  categoryIndex: number;
  questionIndex: number;
  question: string;
  answer: string;
  value: number;
  buzzedTeam: BuzzEvent | null;
  buzzerLocked: boolean;
}

export interface BuzzEvent {
  teamId: string;
  teamName: string;
  timestamp: number;
}

export interface Team {
  id: string;
  game_id: string;
  name: string;
  score: number;
  connected: boolean;
}

export interface Game {
  id: string;
  host_id: string;
  is_started: boolean;
  categories: Category[];
  active_question: ActiveQuestion | null;
  show_answer: boolean;
}

// Database row types (for Supabase queries)
export interface GameRow {
  id: string;
  host_id: string;
  is_started: boolean;
  categories: Category[];
  active_question: ActiveQuestion | null;
  show_answer: boolean;
  created_at: string;
}

export interface TeamRow {
  id: string;
  game_id: string;
  name: string;
  score: number;
  connected: boolean;
  created_at: string;
}

export interface BuzzRow {
  id: number;
  game_id: string;
  team_id: string;
  team_name: string;
  timestamp: number;
  created_at: string;
}
