export interface PracticeResult {
  id: string;
  type: string;
  digits: number;
  totalProblems: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  timeSpent: number;
  timestamp: number;
}

export interface FaceTwoResult {
  id: string;
  type: 'face-two';
  totalProblems: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  timestamp: number;
}

export type Result = PracticeResult | FaceTwoResult;

export interface StorageData {
  results: Result[];
}

const STORAGE_KEY = 'calculation-mastery-results';

export const getStorageData = (): StorageData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { results: [] };
  } catch {
    return { results: [] };
  }
};

export const saveResult = (result: PracticeResult): void => {
  try {
    const data = getStorageData();
    data.results.push(result);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.error('Failed to save result');
  }
};

export const saveFaceTwoResult = (result: FaceTwoResult): void => {
  try {
    const data = getStorageData();
    data.results.push(result);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.error('Failed to save Face Two result');
  }
};

export const getResults = (): PracticeResult[] => {
  const data = getStorageData();
  return data.results;
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.error('Failed to clear history');
  }
};

export const getResultsByType = (type: string): PracticeResult[] => {
  return getResults().filter((r) => r.type === type);
};

export const getFaceTwoResults = (): FaceTwoResult[] => {
  const data = getStorageData();
  return data.results.filter((r) => r.type === 'face-two') as FaceTwoResult[];
};

export const getAverageAccuracy = (type?: string): number => {
  const data = getStorageData();
  let results: Result[];

  if (type === 'face-two') {
    results = data.results.filter((r) => r.type === 'face-two');
  } else if (type) {
    results = data.results.filter((r) => r.type === type);
  } else {
    results = data.results;
  }

  if (results.length === 0) return 0;
  const totalAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0);
  return Math.round(totalAccuracy / results.length);
};
