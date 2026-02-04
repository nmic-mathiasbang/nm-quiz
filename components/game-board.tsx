"use client";

import { Category } from "@/lib/database.types";

// Props for the GameBoard component
interface GameBoardProps {
  categories: Category[];
  onSelectQuestion: (categoryIndex: number, questionIndex: number) => void;
  disabled?: boolean;
}

// Jeopardy-style game board grid - fills full screen
export function GameBoard({ categories, onSelectQuestion, disabled }: GameBoardProps) {
  // Point values for each row
  const values = [100, 200, 300, 400, 500];

  return (
    <div className="w-full h-full flex flex-col gap-2">
      {/* Category headers row */}
      <div className="grid grid-cols-6 gap-2">
        {categories.map((category, catIndex) => (
          <div
            key={`header-${catIndex}`}
            className="bg-gray-900 text-white p-3 text-center font-bold text-base lg:text-lg rounded-lg"
          >
            {category.name}
          </div>
        ))}
      </div>

      {/* Question grid - fills remaining height */}
      <div className="flex-1 grid grid-cols-6 grid-rows-5 gap-2">
        {values.map((value, rowIndex) => (
          categories.map((category, catIndex) => {
            const question = category.questions[rowIndex];
            const isUsed = question?.used ?? false;

            return (
              <button
                key={`cell-${catIndex}-${rowIndex}`}
                onClick={() => !isUsed && !disabled && onSelectQuestion(catIndex, rowIndex)}
                disabled={isUsed || disabled}
                className={`
                  flex items-center justify-center
                  text-2xl lg:text-4xl font-bold rounded-lg
                  transition-all duration-200
                  ${isUsed 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 text-black hover:bg-gray-300 hover:scale-[1.02] cursor-pointer'
                  }
                  ${disabled && !isUsed ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isUsed ? '' : `$${value}`}
              </button>
            );
          })
        ))}
      </div>
    </div>
  );
}
