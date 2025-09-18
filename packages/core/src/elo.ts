export type EloComputation = {
  ratings: number[];
  placements: number[];
  kFactor?: number;
};

export type EloOutcome = {
  newRatings: number[];
  deltas: number[];
  expectedScores: number[];
};

export function computeElo({ ratings, placements, kFactor = 32 }: EloComputation): EloOutcome {
  if (ratings.length !== placements.length) {
    throw new Error("ratings and placements length mismatch");
  }
  const expectedScores = ratings.map(() => 0);
  const deltas = ratings.map(() => 0);

  for (let i = 0; i < ratings.length; i++) {
    for (let j = 0; j < ratings.length; j++) {
      if (i === j) continue;
      const expected = expectedScore(ratings[i], ratings[j]);
      const actual = placementToScore(placements[i], placements[j]);
      expectedScores[i] += expected / (ratings.length - 1);
      deltas[i] += kFactor * (actual - expected);
    }
  }

  const newRatings = ratings.map((rating, index) => Math.round(rating + deltas[index]));
  return { newRatings, deltas: deltas.map((d) => Math.round(d)), expectedScores };
}

function expectedScore(ratingA: number, ratingB: number) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function placementToScore(placementA: number, placementB: number) {
  if (placementA < placementB) return 1;
  if (placementA === placementB) return 0.5;
  return 0;
}

export function computePointRewards(placements: number[]): number[] {
  return placements.map((placement) => {
    switch (placement) {
      case 1:
        return 40;
      case 2:
        return 15;
      case 3:
        return 5;
      default:
        return 0;
    }
  });
}
