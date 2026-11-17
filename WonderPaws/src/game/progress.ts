import { allChallengeIds, levels, worldDefinitions } from "./levels";
import type { ChallengeProgress, ChallengeRunResult, PlayerProgress } from "./types";

const STORAGE_KEY = "wonderpaws-progress";
const SAVE_VERSION = 1;

export function emptyProgress(): PlayerProgress {
  return {
    version: SAVE_VERSION,
    completedChallengeIds: [],
    challenges: {},
    levels: {},
    academyCompletedIds: [],
    discoveredAnimalIds: [],
    updatedAt: new Date().toISOString(),
  };
}

function normaliseProgress(value: unknown): PlayerProgress {
  if (!value || typeof value !== "object") return emptyProgress();
  const parsed = value as Partial<PlayerProgress>;
  if (parsed.version !== SAVE_VERSION) return emptyProgress();
  const challenges = parsed.challenges && typeof parsed.challenges === "object" ? parsed.challenges : {};
  const levelsSaved = parsed.levels && typeof parsed.levels === "object" ? parsed.levels : {};
  const allowedChallengeIds = new Set(allChallengeIds);
  const cleanChallenges: Record<string, ChallengeProgress> = {};
  for (const [id, item] of Object.entries(challenges)) {
    if (!allowedChallengeIds.has(id) || !item || typeof item !== "object") continue;
    cleanChallenges[id] = {
      completed: Boolean(item.completed),
      bestStars: Math.max(0, Math.min(3, Number(item.bestStars) || 0)),
      bestMistakes: Math.max(0, Number(item.bestMistakes) || 0),
      bestBlockCount: Math.max(0, Number(item.bestBlockCount) || 0),
    };
  }
  const cleanLevels: PlayerProgress["levels"] = {};
  for (const level of levels) {
    const item = levelsSaved[level.id];
    if (!item || typeof item !== "object") continue;
    cleanLevels[level.id] = { completed: Boolean(item.completed), stars: Math.max(0, Math.min(3, Number(item.stars) || 0)) };
  }
  return {
    version: SAVE_VERSION,
    completedChallengeIds: Object.keys(cleanChallenges).filter((id) => cleanChallenges[id]?.completed),
    challenges: cleanChallenges,
    levels: cleanLevels,
    academyCompletedIds: Array.isArray(parsed.academyCompletedIds) ? parsed.academyCompletedIds.filter((id): id is string => typeof id === "string") : [],
    discoveredAnimalIds: Array.isArray(parsed.discoveredAnimalIds) ? parsed.discoveredAnimalIds.filter((id): id is string => typeof id === "string") : [],
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
  };
}

export function loadProgress(): PlayerProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    return normaliseProgress(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: PlayerProgress): PlayerProgress {
  const next = { ...progress, updatedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The current play session continues even when browser storage is unavailable.
    }
  }
  return next;
}

export function recordChallengeResult(progress: PlayerProgress, challengeId: string, result: ChallengeRunResult): PlayerProgress {
  if (!result.completed) return progress;
  const previous = progress.challenges[challengeId];
  const nextChallenge: ChallengeProgress = {
    completed: true,
    bestStars: Math.max(previous?.bestStars ?? 0, result.stars),
    bestMistakes: previous?.completed ? Math.min(previous.bestMistakes, result.mistakes) : result.mistakes,
    bestBlockCount: previous?.completed ? Math.min(previous.bestBlockCount, result.blockCount) : result.blockCount,
  };
  const challenges = { ...progress.challenges, [challengeId]: nextChallenge };
  const completedChallengeIds = Object.keys(challenges).filter((id) => challenges[id]?.completed);
  const levelId = challengeId.slice(0, challengeId.lastIndexOf("-") );
  const level = levels.find((item) => item.id === levelId);
  const levelComplete = Boolean(level?.challenges.every((challenge) => challenges[challenge.id]?.completed));
  const oldLevel = progress.levels[levelId];
  const levelStars = levelComplete && level
    ? Math.min(...level.challenges.map((challenge) => challenges[challenge.id]?.bestStars ?? 0))
    : oldLevel?.stars ?? 0;
  const next = {
    ...progress,
    challenges,
    completedChallengeIds,
    levels: level ? { ...progress.levels, [levelId]: { completed: levelComplete || Boolean(oldLevel?.completed), stars: Math.max(oldLevel?.stars ?? 0, levelStars) } } : progress.levels,
  };
  return saveProgress(next);
}

export function markAcademyLesson(progress: PlayerProgress, lessonId: string): PlayerProgress {
  if (progress.academyCompletedIds.includes(lessonId)) return progress;
  return saveProgress({ ...progress, academyCompletedIds: [...progress.academyCompletedIds, lessonId] });
}

export function markAnimalsDiscovered(progress: PlayerProgress, animalIds: string[]): PlayerProgress {
  const next = Array.from(new Set([...progress.discoveredAnimalIds, ...animalIds]));
  return saveProgress({ ...progress, discoveredAnimalIds: next });
}

export function resetProgress(): PlayerProgress {
  if (typeof window !== "undefined") {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* Ignore storage failures. */ }
  }
  return emptyProgress();
}

export function levelStars(progress: PlayerProgress, levelId: string): number {
  return progress.levels[levelId]?.stars ?? 0;
}

export function worldStars(progress: PlayerProgress, worldId: string): number {
  return levels.filter((level) => level.worldId === worldId).reduce((sum, level) => sum + levelStars(progress, level.id), 0);
}

export function isWorldUnlocked(progress: PlayerProgress, worldId: string): boolean {
  const world = worldDefinitions.find((item) => item.id === worldId);
  if (!world || world.order === 1) return true;
  const previousWorld = worldDefinitions.find((item) => item.order === world.order - 1);
  return Boolean(previousWorld && worldStars(progress, previousWorld.id) >= 9);
}

export function isLevelUnlocked(progress: PlayerProgress, levelId: string): boolean {
  const level = levels.find((item) => item.id === levelId);
  if (!level || !isWorldUnlocked(progress, level.worldId)) return false;
  if (level.order === 1) return true;
  const previous = levels.find((item) => item.worldId === level.worldId && item.order === level.order - 1);
  return Boolean(previous && progress.levels[previous.id]?.completed);
}

export function isChallengeUnlocked(progress: PlayerProgress, levelId: string, challengeId: string): boolean {
  const level = levels.find((item) => item.id === levelId);
  const index = level?.challenges.findIndex((challenge) => challenge.id === challengeId) ?? -1;
  if (!level || index < 0 || !isLevelUnlocked(progress, levelId)) return false;
  if (index === 0) return true;
  return Boolean(progress.challenges[level.challenges[index - 1]?.id ?? ""]?.completed);
}

export function worldProgressPercent(progress: PlayerProgress, worldId: string): number {
  const worldLevels = levels.filter((item) => item.worldId === worldId);
  const complete = worldLevels.filter((item) => progress.levels[item.id]?.completed).length;
  return Math.round((complete / worldLevels.length) * 100);
}
