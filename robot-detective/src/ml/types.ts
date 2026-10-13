export const FEATURE_KEYS = ['colour','eyes','antennae','horns','tail','pattern','body','limbs'] as const;
export type FeatureKey = typeof FEATURE_KEYS[number];
export type CreatureFeatures = Record<FeatureKey, string>;
export interface Creature { id:string; name:string; features:CreatureFeatures; }
export interface Category { id:string; name:string; colour:string; }
export interface Example { id:string; creature:Creature; label:string; }
export type Algorithm = 'tree'|'knn';
export interface Prediction { label:string; scores:Record<string,number>; neighbors?:Array<{name:string; label:string; distance:number}>; path?:string[]; evidence:string[]; }
export interface ModelSnapshot { version:number; datasetVersion:number; algorithm:Algorithm; trainedAt:string; examples:Example[]; categories:Category[]; predict:(features:CreatureFeatures)=>Prediction; }
export interface EvaluationResult { modelVersion:number; testVersion:number; total:number; correct:number; accuracy:number; perCategory:Record<string,{total:number;correct:number}>; matrix:Record<string,Record<string,number>>; predictions:Array<{creature:Creature;actual:string;predicted:string;correct:boolean}>; }
