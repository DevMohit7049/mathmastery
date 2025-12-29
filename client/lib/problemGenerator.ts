export interface Problem {
  numbers: number[];
  answer: number;
}

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getMaxNumberForDigits = (digits: number): number => {
  return Math.pow(10, digits) - 1;
};

const getMinNumberForDigits = (digits: number): number => {
  if (digits === 1) return 0;
  return Math.pow(10, digits - 1);
};

export const generateAdditionProblems = (
  digitCount: number,
  numCount: number,
  total: number = 10
): Problem[] => {
  const maxNum = getMaxNumberForDigits(digitCount);
  const minNum = digitCount === 1 ? 0 : getMinNumberForDigits(digitCount);
  const problems: Problem[] = [];

  for (let i = 0; i < total; i++) {
    const numbers: number[] = [];
    for (let j = 0; j < numCount; j++) {
      numbers.push(getRandomNumber(minNum, maxNum));
    }
    const answer = numbers.reduce((sum, num) => sum + num, 0);
    problems.push({ numbers, answer });
  }

  return problems;
};

export const generateSubtractionProblems = (
  digitCount: number,
  numCount: number,
  total: number = 10
): Problem[] => {
  const maxNum = getMaxNumberForDigits(digitCount);
  const minNum = digitCount === 1 ? 0 : getMinNumberForDigits(digitCount);
  const problems: Problem[] = [];

  for (let i = 0; i < total; i++) {
    const numbers: number[] = [];
    for (let j = 0; j < numCount; j++) {
      numbers.push(getRandomNumber(minNum, maxNum));
    }

    // Sort in descending order to avoid negative results
    numbers.sort((a, b) => b - a);

    let answer = numbers[0];
    for (let j = 1; j < numbers.length; j++) {
      answer -= numbers[j];
    }

    // Ensure non-negative answer
    if (answer < 0) {
      answer = Math.abs(answer);
    }

    problems.push({ numbers, answer });
  }

  return problems;
};

export const generateMultiplicationProblems = (
  digitCount: number,
  numCount: number,
  total: number = 10
): Problem[] => {
  const maxNum = getMaxNumberForDigits(digitCount);
  const minNum = digitCount === 1 ? 0 : getMinNumberForDigits(digitCount);
  const problems: Problem[] = [];

  for (let i = 0; i < total; i++) {
    const numbers: number[] = [];
    for (let j = 0; j < numCount; j++) {
      numbers.push(getRandomNumber(minNum, maxNum));
    }

    let answer = 1;
    for (const num of numbers) {
      answer *= num;
    }

    problems.push({ numbers, answer });
  }

  return problems;
};

export const generateDivisionProblems = (
  digitCount: number,
  numCount: number,
  total: number = 10
): Problem[] => {
  const maxNum = getMaxNumberForDigits(digitCount);
  const minNum = digitCount === 1 ? 1 : getMinNumberForDigits(digitCount);
  const problems: Problem[] = [];

  for (let i = 0; i < total; i++) {
    const numbers: number[] = [];

    // For division, we generate numbers and then create a problem where the answer is whole
    // First number is the dividend, rest are divisors
    for (let j = 0; j < numCount; j++) {
      numbers.push(getRandomNumber(minNum, maxNum));
    }

    // Calculate answer
    let answer = numbers[0];
    for (let j = 1; j < numbers.length; j++) {
      answer = Math.floor(answer / numbers[j]);
    }

    problems.push({ numbers, answer });
  }

  return problems;
};

export const generateProblems = (
  type: 'addition' | 'subtraction' | 'multiplication' | 'division',
  digitCount: number,
  numCount: number,
  total: number = 10
): Problem[] => {
  switch (type) {
    case 'addition':
      return generateAdditionProblems(digitCount, numCount, total);
    case 'subtraction':
      return generateSubtractionProblems(digitCount, numCount, total);
    case 'multiplication':
      return generateMultiplicationProblems(digitCount, numCount, total);
    case 'division':
      return generateDivisionProblems(digitCount, numCount, total);
    default:
      return [];
  }
};
