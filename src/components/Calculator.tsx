import React, { useEffect, useCallback } from 'react';
import { CalculatorButton } from './CalculatorButton';
import { useCalculator } from '@/hooks/useCalculator';

interface CalculatorProps {
  onTriggerActivated: () => void;
  triggerSequence: string;
  onSettingsAccess: () => void;
}

export function Calculator({ onTriggerActivated, triggerSequence, onSettingsAccess }: CalculatorProps) {
  const {
    display,
    inputDigit,
    inputDecimal,
    clearAll,
    toggleSign,
    inputPercent,
    performOperation,
    calculate,
    checkTriggerSequence,
    clearHistory,
  } = useCalculator();

  const handleButtonPress = useCallback((action: () => string) => {
    action();
    if (triggerSequence && checkTriggerSequence(triggerSequence)) {
      clearHistory();
      onTriggerActivated();
    }
  }, [triggerSequence, checkTriggerSequence, clearHistory, onTriggerActivated]);

  // Secret settings access: long press on display
  const [pressTimer, setPressTimer] = React.useState<NodeJS.Timeout | null>(null);
  
  const handleDisplayPressStart = () => {
    const timer = setTimeout(() => {
      onSettingsAccess();
    }, 3000);
    setPressTimer(timer);
  };

  const handleDisplayPressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const formatDisplay = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (value.length > 9) {
      return num.toExponential(3);
    }
    return value;
  };

  return (
    <div className="flex flex-col h-full bg-background p-4">
      {/* Display */}
      <div 
        className="flex-1 flex items-end justify-end mb-4 select-none"
        onMouseDown={handleDisplayPressStart}
        onMouseUp={handleDisplayPressEnd}
        onMouseLeave={handleDisplayPressEnd}
        onTouchStart={handleDisplayPressStart}
        onTouchEnd={handleDisplayPressEnd}
      >
        <span className="text-7xl font-light text-foreground tracking-tight">
          {formatDisplay(display)}
        </span>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <CalculatorButton variant="function" onClick={() => handleButtonPress(clearAll)}>
          {display === '0' ? 'AC' : 'C'}
        </CalculatorButton>
        <CalculatorButton variant="function" onClick={() => handleButtonPress(toggleSign)}>
          ±
        </CalculatorButton>
        <CalculatorButton variant="function" onClick={() => handleButtonPress(inputPercent)}>
          %
        </CalculatorButton>
        <CalculatorButton variant="operator" onClick={() => handleButtonPress(() => performOperation('÷'))}>
          ÷
        </CalculatorButton>

        {/* Row 2 */}
        <CalculatorButton onClick={() => handleButtonPress(() => inputDigit('7'))}>7</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonPress(() => inputDigit('8'))}>8</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonPress(() => inputDigit('9'))}>9</CalculatorButton>
        <CalculatorButton variant="operator" onClick={() => handleButtonPress(() => performOperation('×'))}>
          ×
        </CalculatorButton>

        {/* Row 3 */}
        <CalculatorButton onClick={() => handleButtonPress(() => inputDigit('4'))}>4</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonPress(() => inputDigit('5'))}>5</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonPress(() => inputDigit('6'))}>6</CalculatorButton>
        <CalculatorButton variant="operator" onClick={() => handleButtonPress(() => performOperation('-'))}>
          −
        </CalculatorButton>

        {/* Row 4 */}
        <CalculatorButton onClick={() => handleButtonPress(() => inputDigit('1'))}>1</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonPress(() => inputDigit('2'))}>2</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonPress(() => inputDigit('3'))}>3</CalculatorButton>
        <CalculatorButton variant="operator" onClick={() => handleButtonPress(() => performOperation('+'))}>
          +
        </CalculatorButton>

        {/* Row 5 */}
        <CalculatorButton wide onClick={() => handleButtonPress(() => inputDigit('0'))}>0</CalculatorButton>
        <CalculatorButton onClick={() => handleButtonPress(inputDecimal)}>.</CalculatorButton>
        <CalculatorButton variant="operator" onClick={() => handleButtonPress(calculate)}>
          =
        </CalculatorButton>
      </div>
    </div>
  );
}
