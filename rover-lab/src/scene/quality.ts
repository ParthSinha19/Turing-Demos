/** Graphics quality presets for ordinary school computers up to gaming PCs. */
export type QualityLevel = "low" | "medium" | "high";

export interface QualityPreset {
  label: string;
  dpr: [number, number];
  shadowMapSize: number;
  terrainSegments: number;
  rockDensity: number;
  dust: boolean;
  antialias: boolean;
}

export const QUALITY: Record<QualityLevel, QualityPreset> = {
  low: { label: "Low", dpr: [1, 1], shadowMapSize: 1024, terrainSegments: 150, rockDensity: 0.45, dust: false, antialias: false },
  medium: { label: "Medium", dpr: [1, 1.5], shadowMapSize: 2048, terrainSegments: 200, rockDensity: 0.8, dust: true, antialias: true },
  high: { label: "High", dpr: [1, 2], shadowMapSize: 4096, terrainSegments: 300, rockDensity: 1, dust: true, antialias: true },
};
