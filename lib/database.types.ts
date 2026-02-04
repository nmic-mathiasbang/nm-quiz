// Database types for Supabase tables

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          host_id: string;
          is_started: boolean;
          categories: Category[];
          active_question: ActiveQuestion | null;
          show_answer: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          host_id: string;
          is_started?: boolean;
          categories?: Category[];
          active_question?: ActiveQuestion | null;
          show_answer?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          host_id?: string;
          is_started?: boolean;
          categories?: Category[];
          active_question?: ActiveQuestion | null;
          show_answer?: boolean;
          created_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          game_id: string;
          name: string;
          score: number;
          connected: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          name: string;
          score?: number;
          connected?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          name?: string;
          score?: number;
          connected?: boolean;
          created_at?: string;
        };
      };
      buzzes: {
        Row: {
          id: number;
          game_id: string;
          team_id: string;
          team_name: string;
          timestamp: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          game_id: string;
          team_id: string;
          team_name: string;
          timestamp: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          game_id?: string;
          team_id?: string;
          team_name?: string;
          timestamp?: number;
          created_at?: string;
        };
      };
    };
  };
}

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
