'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  starSize?: number;
};

export function StarRating({
  rating,
  onRatingChange,
  readOnly = false,
  starSize = 24,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  const handleClick = (index: number) => {
    if (readOnly || !onRatingChange) return;
    onRatingChange(index);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((index) => {
        const fillValue = (hoverRating || rating) >= index ? '100%' : '0%';
        return (
          <div
            key={index}
            className={cn('relative', !readOnly && 'cursor-pointer')}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
          >
            <Star
              className="text-gray-300 dark:text-gray-600"
              style={{ height: starSize, width: starSize }}
              fill="currentColor"
            />
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{ width: fillValue }}
            >
              <Star
                className="text-yellow-400"
                style={{ height: starSize, width: starSize }}
                fill="currentColor"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
