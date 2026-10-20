import { randomUUID } from "crypto";

export function genId(): string {
  return randomUUID();
}

export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "O";
  if (percentage >= 80) return "A+";
  if (percentage >= 70) return "A";
  if (percentage >= 60) return "B+";
  if (percentage >= 50) return "B";
  if (percentage >= 40) return "C";
  if (percentage >= 35) return "D";
  return "F";
}

export function calculateSGPA(results: { grade: string; credits: number }[]): number {
  const gradePoints: Record<string, number> = {
    O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, D: 4, F: 0,
  };
  let totalCredits = 0;
  let totalPoints = 0;
  for (const r of results) {
    const gp = gradePoints[r.grade] ?? 0;
    totalPoints += gp * r.credits;
    totalCredits += r.credits;
  }
  return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
}

export function today(): string {
  return new Date().toISOString().split("T")[0];
}
