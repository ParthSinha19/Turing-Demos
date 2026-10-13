import type { Creature, EvaluationResult, ModelSnapshot } from './types';
export interface TestCase {creature:Creature;actual:string;}
export function evaluate(model:ModelSnapshot,testCases:TestCase[],testVersion:number):EvaluationResult{
 const labels=model.categories.map(c=>c.id),perCategory:EvaluationResult['perCategory']={},matrix:EvaluationResult['matrix']={};labels.forEach(a=>{perCategory[a]={total:0,correct:0};matrix[a]=Object.fromEntries(labels.map(b=>[b,0]));});
 const predictions=testCases.map(t=>{const predicted=model.predict(t.creature.features).label;const correct=predicted===t.actual;if(perCategory[t.actual]){perCategory[t.actual].total++;if(correct)perCategory[t.actual].correct++;}if(matrix[t.actual])matrix[t.actual][predicted]=(matrix[t.actual][predicted]||0)+1;return {...t,predicted,correct};});const correct=predictions.filter(p=>p.correct).length;return {modelVersion:model.version,testVersion,total:testCases.length,correct,accuracy:testCases.length?correct/testCases.length:0,perCategory,matrix,predictions};
}
