import { LEVELS, FINAL_LEVEL, shortest, runProgram } from '../src/game/nav.js';
import { S_TRAIN, S_TEST, runTest, E_TEACH, E_TESTS, eItem, predict, E_KEYS } from '../src/game/classify.js';
import { CREATURES, clusterCreatures, FEATURES } from '../src/game/cluster.js';
import { decide } from '../src/game/rules.js';
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };

[...LEVELS, FINAL_LEVEL].forEach((l) => { const s = shortest(l); ok(s !== null, `nav level ${l.id} solvable, shortest=${s}`); });
ok(runProgram(['F','F','F','F'], LEVELS[0]).ok, 'L1 FFFF reaches rover');
ok(runProgram(['F','F','F','F','F','F'], LEVELS[2]).event === 'rock', 'L3 straight line hits rock');

// Saturn: few examples -> mistakes; full + mistakes added -> all right
const few = [S_TRAIN[0], S_TRAIN[3], S_TRAIN[6], S_TRAIN[9]];
const r1 = runTest(few); ok(r1.filter(x=>x.ok).length < 6, `Saturn few examples score ${r1.filter(x=>x.ok).length}/6`);
const r2 = runTest(S_TRAIN); ok(r2.filter(x=>x.ok).length < 5, `Saturn full train still has traps (${r2.filter(x=>x.ok).length}/6)`);
const fixed = [...S_TRAIN, S_TEST[3], S_TEST[5]]; const r3 = runTest(fixed);
ok(r3.filter(x=>x.ok).length >= 5, `Saturn after adding mistakes ${r3.filter(x=>x.ok).length}/6`);

// Earth: ball is a deliberate mistake, fixed by teaching
const ex = E_TEACH.map(eItem);
ok(predict(ex, eItem('ball'), E_KEYS).label === 'food', 'Earth ball predicted food (deliberate mistake)');
const ex2 = [...ex, eItem('ball')];
ok(predict(ex2, eItem('ball'), E_KEYS).label === 'toy', 'Earth ball right after teaching');
E_TESTS.slice(1).forEach((t) => ok(predict(ex2, eItem(t), E_KEYS).label === eItem(t).label, `Earth ${t} correct`));

// Neptune: features change the grouping
const ids = FEATURES.map(f=>f.id);
const a = clusterCreatures(CREATURES, ids, 3), b = clusterCreatures(CREATURES, ['legs'], 3), c = clusterCreatures(CREATURES, ['colour'], 3);
console.log('all :', a.labels.join('')); console.log('legs:', b.labels.join('')); console.log('col :', c.labels.join(''));
ok(a.labels.join('') !== b.labels.join('') || b.labels.join('') !== c.labels.join(''), 'Neptune groupings differ with features');
ok(clusterCreatures(CREATURES, ids, 3).labels.join('') === a.labels.join(''), 'Neptune deterministic');

// Jupiter: order matters
const rules1 = [{cond:'hungry',action:'food'},{cond:'lowO2',action:'oxygen'}];
ok(decide(rules1,['lowO2','hungry']).action==='food', 'Jupiter wrong order picks food');
ok(decide([rules1[1],rules1[0]],['lowO2','hungry']).action==='oxygen', 'Jupiter right order picks oxygen');
process.exit(fail ? 1 : 0);
