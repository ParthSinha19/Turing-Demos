import { FEATURE_KEYS, type Algorithm, type Category, type CreatureFeatures, type Example, type Prediction } from './types';
const distance=(a:CreatureFeatures,b:CreatureFeatures)=>FEATURE_KEYS.reduce((sum,k)=>sum+(a[k]===b[k]?0:1),0);
const counts=(examples:Example[])=>examples.reduce<Record<string,number>>((acc,e)=>(acc[e.label]=(acc[e.label]||0)+1,acc),{});
const normalize=(c:Record<string,number>, labels:string[])=>{const total=Object.values(c).reduce((a,b)=>a+b,0)||1;return Object.fromEntries(labels.map(l=>[l,(c[l]||0)/total]));};
const winner=(scores:Record<string,number>, labels:string[])=>labels.slice().sort((a,b)=>(scores[b]??0)-(scores[a]??0)||a.localeCompare(b))[0]??'Unknown';
export function trainKnn(examples:Example[], categories:Category[], k=3){
 if(!examples.length) throw new Error('Add at least one labelled example before training.');
 const labels=categories.map(c=>c.id);
 return (features:CreatureFeatures):Prediction=>{
  const ordered=examples.map(e=>({e,distance:distance(features,e.creature.features)})).sort((a,b)=>a.distance-b.distance); const kthDistance=ordered[Math.min(k,ordered.length)-1].distance; const neighbors=ordered.filter(n=>n.distance<=kthDistance);
  const votes:Record<string,number>={}; neighbors.forEach(({e,distance:d})=>{votes[e.label]=(votes[e.label]||0)+(d===0?2:1/(d));});
  const scores=normalize(votes,labels); const label=winner(scores,labels);
  const nearest=neighbors[0]; const evidence=nearest.distance===0?`I found an identical feature pattern in the examples. ${neighbors.filter(n=>n.distance===0).length} nearest example(s) match exactly.`:`My ${neighbors.length} nearest example(s) differ by ${nearest.distance} of ${FEATURE_KEYS.length} features.`;
  return {label,scores,neighbors:neighbors.map(n=>({name:n.e.creature.name,label:n.e.label,distance:n.distance})),evidence:[evidence, ...(new Set(neighbors.map(n=>n.e.label))).size>1?['Nearby examples carry different labels, so the evidence is mixed.']:[]]};
 };
}
interface Node { counts:Record<string,number>; feature?:string; branches?:Record<string,Node>; majority:string; }
function gini(examples:Example[]){const c=counts(examples),n=examples.length||1;return 1-Object.values(c).reduce((s,v)=>s+(v/n)**2,0);}
function buildTree(examples:Example[], features:string[], labels:string[], depth=0):Node{
 const c=counts(examples),majority=winner(c,labels); const node:Node={counts:c,majority};
 if(!examples.length||Object.keys(c).length<=1||!features.length||depth>=FEATURE_KEYS.length)return node;
 let best:{feature:string;gain:number;groups:Record<string,Example[]>}|undefined; const parent=gini(examples);
 for(const feature of features){const groups:Record<string,Example[]>={};for(const e of examples){const value=e.creature.features[feature as keyof CreatureFeatures];(groups[value]??=[]).push(e);}const weighted=Object.values(groups).reduce((s,g)=>s+g.length/examples.length*gini(g),0);const gain=parent-weighted;if(!best||gain>best.gain+1e-10)best={feature,gain,groups};}
 if(!best||best.gain<=1e-10)return node;
 node.feature=best.feature;node.branches={};for(const [value,group] of Object.entries(best.groups))node.branches[value]=buildTree(group,features.filter(f=>f!==best!.feature),labels,depth+1);return node;
}
export function trainTree(examples:Example[],categories:Category[]){
 if(!examples.length)throw new Error('Add at least one labelled example before training.'); const labels=categories.map(c=>c.id);const root=buildTree(examples,[...FEATURE_KEYS],labels);
 return (features:CreatureFeatures):Prediction=>{let node=root;const path:string[]=[];while(node.feature&&node.branches){const value=features[node.feature as keyof CreatureFeatures];path.push(`${node.feature}: ${value}`);const next=node.branches[value];if(!next){path.push(`No training branch for “${value}”; using the most common label at this node.`);break;}node=next;}const scores=normalize(node.counts,labels);const label=node.majority;const evidence=path.length? [`Decision path: ${path.join(' → ')}.`, `This leaf contains ${Object.values(node.counts).reduce((a,b)=>a+b,0)} training example(s).`]:['No useful feature split was found in these examples; prediction uses the most common label in the training set.'];return {label,scores,path,evidence};};
}
export function trainClassifier(algorithm:Algorithm,examples:Example[],categories:Category[]){return algorithm==='tree'?trainTree(examples,categories):trainKnn(examples,categories);}
export {distance};
