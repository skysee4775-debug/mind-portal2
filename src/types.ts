export interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    score: Record<string, number>; // e.g. { meerkat: 2, sloth: 1 }
  }[];
}

export interface TestResult {
  id: string;
  name: string;
  title: string;
  description: string;
  strengths: string[];
  stressSigns: string[];
  tips: string[];
  imageUrl: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  answer: boolean; // true = O, false = X
  explanation: string;
}

export interface Quote {
  id: number;
  text: string;
  author: string;
}

export interface Post {
  id: string;
  category: "Social" | "Learning" | "Emotion" | "Growth";
  title: string;
  content: string;
  createdAt: string;
  likes: number;
}

export type DiagnosticTestId = "PHQ-9" | "GAD-7" | "ISI" | "PSS" | "LOVE" | "EGOGRAM" | "BIG5";

export interface DiagnosticQuestion {
  id: number;
  text: string;
  options: {
    text: string;
    value: number; // For PHQ-9, GAD-7, ISI, PSS
    category?: string; // For LOVE ("words", "time", "gifts", "acts", "touch") or EGOGRAM ("CP", "NP", "A", "FC", "AC")
  }[];
}

export interface CounselingRequest {
  id: string;
  studentName: string;
  department: string;
  studentId: string;
  contact: string;
  method: "face_to_face" | "online";
  preferredDate: string;
  preferredTime: string;
  testName: string;
  testResultSummary: string;
  status: "pending" | "confirmed" | "completed";
  createdAt: string;
}
