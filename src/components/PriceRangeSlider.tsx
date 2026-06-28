import React, { useMemo } from 'react';

interface PriceRangeSliderProps {
  min: number | '';
  max: number | '';
  minLimit: number;
  maxLimit: number;
  onChange: (min: number, max: number) => void;
  step?: number;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  minLimit,
  maxLimit,
  onChange,
  step = 10000,
}) => {
  const currentMin = min === '' ? minLimit : min;
  const currentMax = max === '' ? maxLimit : max;

  // Calculate percentages for the background track coloring
  const minPercent = useMemo(() => {
    const range = maxLimit - minLimit;
    if (range === 0) return 0;
    return ((currentMin - minLimit) / range) * 100;
  }, [currentMin, minLimit, maxLimit]);

  const maxPercent = useMemo(() => {
    const range = maxLimit - minLimit;
    if (range === 0) return 100;
    return ((currentMax - minLimit) / range) * 100;
  }, [currentMax, minLimit, maxLimit]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    // Don't allow min to go past max minus one step
    const nextMin = Math.min(val, currentMax - step);
    onChange(nextMin, currentMax);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    // Don't allow max to go below min plus one step
    const nextMax = Math.max(val, currentMin + step);
    onChange(currentMin, nextMax);
  };

  return (
    <div className="w-full py-2" id="price-range-slider-container">
      {/* Dynamic styling for the overlapping dual range inputs */}
      <style>{`
        .range-slider-input {
          position: absolute;
          width: 100%;
          height: 6px;
          top: 0;
          background: none;
          pointer-events: none;
          appearance: none;
          -webkit-appearance: none;
          outline: none;
        }
        
        /* Chrome, Safari, Opera, Edge */
        .range-slider-input::-webkit-slider-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #f97316; /* Tailwind primary-500 */
          border: 2px solid #ffffff;
          cursor: pointer;
          pointer-events: auto;
          appearance: none;
          -webkit-appearance: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.1s ease, background-color 0.1s ease;
        }
        .range-slider-input::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          background: #ea580c; /* Tailwind primary-600 */
        }
        .range-slider-input::-webkit-slider-thumb:active {
          transform: scale(0.95);
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.15);
        }

        /* Firefox */
        .range-slider-input::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #f97316;
          border: 2px solid #ffffff;
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.1s ease, background-color 0.1s ease;
        }
        .range-slider-input::-moz-range-thumb:hover {
          transform: scale(1.15);
          background: #ea580c;
        }
        .range-slider-input::-moz-range-thumb:active {
          transform: scale(0.95);
        }
        
        /* Hide tracks for both so they don't conflict */
        .range-slider-input::-webkit-slider-runnable-track {
          background: none;
        }
        .range-slider-input::-moz-range-track {
          background: none;
        }
      `}</style>

      {/* Values presentation */}
      <div className="flex items-center justify-between mb-3 text-xs font-semibold text-gray-700">
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 flex flex-col items-start">
          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Min</span>
          <span className="font-mono text-gray-800 font-bold text-xs">
            {currentMin.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
        <div className="h-[2px] w-3 bg-gray-300 rounded-full" />
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 flex flex-col items-end">
          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Max</span>
          <span className="font-mono text-gray-800 font-bold text-xs">
            {currentMax.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      </div>

      {/* Double slider wrapper */}
      <div className="relative w-full h-6 flex items-center">
        {/* Track behind inputs */}
        <div className="absolute left-0 right-0 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />
        </div>

        {/* Min handle input */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={currentMin}
          onChange={handleMinChange}
          className="range-slider-input"
          id="price-range-slider-min"
          aria-label="Budget minimum"
        />

        {/* Max handle input */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={currentMax}
          onChange={handleMaxChange}
          className="range-slider-input"
          id="price-range-slider-max"
          aria-label="Budget maximum"
        />
      </div>

      {/* Helper text with limits */}
      <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold uppercase mt-1 px-1">
        <span>{minLimit.toLocaleString('fr-FR')}</span>
        <span>{maxLimit.toLocaleString('fr-FR')}</span>
      </div>
    </div>
  );
};
