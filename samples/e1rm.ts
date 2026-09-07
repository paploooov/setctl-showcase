export interface E1rmResult {
  value: number;
  confidence: "normal" | "low";
}

function confidence(reps: number): E1rmResult["confidence"] {
  return reps > 12 ? "low" : "normal";
}

export function epley(weightKg: number, reps: number): E1rmResult | null {
  if (weightKg < 0 || !Number.isInteger(reps) || reps < 1) return null;
  return {
    value: reps === 1 ? weightKg : weightKg * (1 + reps / 30),
    confidence: confidence(reps),
  };
}

export function brzycki(weightKg: number, reps: number): E1rmResult | null {
  if (weightKg < 0 || !Number.isInteger(reps) || reps < 1 || reps > 36)
    return null;
  return {
    value: reps === 1 ? weightKg : (weightKg * 36) / (37 - reps),
    confidence: confidence(reps),
  };
}
