import { useState } from 'react';
import { Star } from 'lucide-react';

// mode="display": read-only, shows a rating value (supports half-star via fill %)
// mode="input": clickable stars for submitting a rating
export default function StarRating({ value = 0, onChange, mode = 'display', size = 16 }) {
  const [hoverValue, setHoverValue] = useState(0);
  const isInput = mode === 'input';
  const activeValue = isInput ? (hoverValue || value) : value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!isInput}
          onClick={() => isInput && onChange?.(star)}
          onMouseEnter={() => isInput && setHoverValue(star)}
          onMouseLeave={() => isInput && setHoverValue(0)}
          className={isInput ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className={star <= activeValue ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
}