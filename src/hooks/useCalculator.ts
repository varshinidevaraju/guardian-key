import { useState, useCallback } from 'react';

export function useCalculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [buttonHistory, setButtonHistory] = useState<string[]>([]);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
    setButtonHistory(prev => [...prev.slice(-9), digit]);
    return digit;
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
    setButtonHistory(prev => [...prev.slice(-9), '.']);
    return '.';
  }, [display, waitingForOperand]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setButtonHistory(prev => [...prev.slice(-9), 'C']);
    return 'C';
  }, []);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value * -1));
    setButtonHistory(prev => [...prev.slice(-9), '±']);
    return '±';
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
    setButtonHistory(prev => [...prev.slice(-9), '%']);
    return '%';
  }, [display]);

  const performOperation = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue || 0;
      let result: number;

      switch (operator) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
    setButtonHistory(prev => [...prev.slice(-9), nextOperator]);
    return nextOperator;
  }, [display, operator, previousValue]);

  const calculate = useCallback(() => {
    if (operator && previousValue !== null) {
      const inputValue = parseFloat(display);
      let result: number;

      switch (operator) {
        case '+':
          result = previousValue + inputValue;
          break;
        case '-':
          result = previousValue - inputValue;
          break;
        case '×':
          result = previousValue * inputValue;
          break;
        case '÷':
          result = inputValue !== 0 ? previousValue / inputValue : 0;
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
    setButtonHistory(prev => [...prev.slice(-9), '=']);
    return '=';
  }, [display, operator, previousValue]);

  const checkTriggerSequence = useCallback((triggerCode: string): boolean => {
    const lastButtons = buttonHistory.slice(-triggerCode.length).join('');
    return lastButtons === triggerCode;
  }, [buttonHistory]);

  const clearHistory = useCallback(() => {
    setButtonHistory([]);
  }, []);

  return {
    display,
    buttonHistory,
    inputDigit,
    inputDecimal,
    clearAll,
    toggleSign,
    inputPercent,
    performOperation,
    calculate,
    checkTriggerSequence,
    clearHistory,
  };
}
