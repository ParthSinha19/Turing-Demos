const retry = (message) => ({ ok: false, message });
const done = (activity, message) => ({
  ok: true,
  message: message || activity.successMessage || 'That is correct. Excellent detective work!',
});
const sameRecord = (actual, expected, keys) => keys.every((key) => actual?.[key] === expected?.[key]);
const normalise = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const sameSet = (actual, expected) => {
  if (!Array.isArray(actual) || !Array.isArray(expected)) return false;
  const a = [...new Set(actual)].sort();
  const b = [...new Set(expected)].sort();
  return a.length === b.length && a.every((x, i) => x === b[i]);
};

/**
 * Pure activity validator. Correct answers live in activity.validation, away
 * from the presentation config consumed by React activity components.
 * Returns { ok, message }; it never mutates player or mission state.
 */
export function validateActivity(activity, value) {
  if (!activity?.type || !activity?.validation) {
    return retry('This case file is missing its answer guide. Tell headquarters so it can be repaired.');
  }

  const answer = activity.validation;
  switch (activity.type) {
    case 'classify': {
      const placements = value?.placements || {};
      const ids = Object.keys(answer.placements || {});
      const missing = ids.filter((id) => !placements[id]);
      if (missing.length) return retry(`There ${missing.length === 1 ? 'is' : 'are'} still ${missing.length} specimen${missing.length === 1 ? '' : 's'} to sort.`);
      const wrong = ids.filter((id) => placements[id] !== answer.placements[id]);
      return wrong.length ? retry('Look again at the features. A useful clue is one you can point to, such as toes, claws or shape.') : done(activity, 'Every specimen is in the right group. You taught the system to notice useful features!');
    }
    case 'train': {
      const placements = value?.placements || {};
      const expected = answer.placements || {};
      const ids = Object.keys(expected);
      const missing = ids.filter((id) => !placements[id]);
      if (missing.length) return retry(`Label all ${ids.length} training examples before testing the new print.`);
      const wrong = ids.filter((id) => placements[id] !== expected[id]);
      if (wrong.length) return retry('Check the training examples again. The AI needs accurate labels before it can make a useful prediction.');
      if (!value?.prediction) return retry('The examples are labelled. Now choose what F.O.R.E.S.T. should predict for the new print.');
      if (value.prediction !== answer.prediction) return retry('Compare the new print with the examples you labelled. Look at its toes, claws and shape.');
      return done(activity, 'Your labelled examples helped F.O.R.E.S.T. make a better prediction. It compared the features instead of guessing at random!');
    }
    case 'match': {
      const pairs = value?.pairs || {};
      const ids = Object.keys(answer.pairs || {});
      const missing = ids.filter((id) => !pairs[id]);
      if (missing.length) return retry(`Match the remaining ${missing.length} record${missing.length === 1 ? '' : 's'} before checking.`);
      return sameRecord(pairs, answer.pairs, ids) ? done(activity, 'Every record has its correct partner. The muddled file is repaired!') : retry('Some pairs do not belong together. Think about what each clue tells you.');
    }
    case 'sequence': {
      const expected = answer.order || [];
      const actual = value?.order || [];
      if (actual.length !== expected.length) return retry('Every step needs a place in the sequence.');
      if (!actual.every((id, index) => id === expected[index])) return retry('Not quite yet. Start with what must happen first, then follow what depends on it.');
      if (answer.auditSelected && !sameSet(value?.auditSelected || [], answer.auditSelected)) return retry('The steps are in order. Now check the records: duplicates, missing values and incorrect labels need repair.');
      return done(activity, 'The instructions are in order and the damaged records are flagged. The system is ready to restart!');
    }
    case 'process': {
      const expected = answer.order || [];
      const actual = value?.order || [];
      if (actual.length !== expected.length || !actual.every((id, index) => id === expected[index])) {
        return retry('Check the airlock steps. Seal first, release the lock next, and open the door last.');
      }
      const typed = normalise(value?.text).replace(/\s/g, '');
      if (!typed) return retry('The safety steps are in order. Now type the corrected airlock command.');
      const accepted = (answer.accepted || []).map((item) => normalise(item).replace(/\s/g, ''));
      return accepted.includes(typed)
        ? done(activity, 'The safety process is in order and the command is fixed. Airlock restored!')
        : retry('The steps are correct, but the command still has a typo. Compare each letter with the station log.');
    }
    case 'prompt': {
      const slots = value?.slots || {};
      const expectedSlots = answer.slots || {};
      const missing = Object.keys(expectedSlots).filter((id) => !slots[id]);
      if (missing.length) return retry('Finish building your message before sending it to F.O.R.E.S.T.');
      if (!sameRecord(slots, expectedSlots, Object.keys(expectedSlots))) return retry('Try making your instruction more specific. Use recent, relevant information and say exactly what you want the AI to do.');
      if (answer.review && !value?.review) return retry('Read the AI’s reply and choose which evidence supports its prediction.');
      if (answer.review && value.review !== answer.review) return retry('Check the evidence, not how confident the AI sounds. A prediction is a guess that needs testing.');
      return done(activity, 'A clear prompt helped the AI focus. You checked its prediction against evidence too!');
    }
    case 'pattern':
      if (!value?.answer) return retry('Choose the symbol you think fits the signal.');
      return value.answer === answer.answer ? done(activity, activity.config?.mode === 'odd' ? 'Anomaly detected! You found the signal that breaks the pattern.' : 'Signal decoded! You found the part that completes the pattern.') : retry('Look closely at what repeats. Compare the shape and colour before choosing again.');
    case 'type': {
      const typed = normalise(value?.text).replace(/\s/g, '');
      if (!typed) return retry('Type the corrected command into the console first.');
      const accepted = (answer.accepted || []).map((item) => normalise(item).replace(/\s/g, ''));
      return accepted.includes(typed) ? done(activity, 'Command accepted. You found and fixed the typo!') : retry('The console still cannot read that command. Compare every letter with the station log.');
    }
    case 'choice':
    case 'compare':
      if (!value?.choice) return retry('Choose the answer that best fits the clues.');
      return value.choice === answer.choice ? done(activity) : retry('That choice does not match all the evidence. Look at the details again.');
    case 'network': {
      const expectedOrder = answer.order || [];
      const actualOrder = value?.order || [];
      if (actualOrder.length !== expectedOrder.length || !actualOrder.every((id, index) => id === expectedOrder[index])) return retry('Route the message from the ground sender through both relays to the receiver.');
      if (!sameSet(value?.selected || [], answer.selected || [])) return retry('The route is correct. Now flag every unusual packet: duplicates, missing details and changed symbols.');
      return done(activity, 'The packet reached its destination, and the unusual records are flagged for repair!');
    }
    case 'select': {
      const actual = value?.selected || [];
      if (!actual.length) return retry('Select the information that is useful for this investigation.');
      return sameSet(actual, answer.selected || []) ? done(activity) : retry('Some selected details are not useful, or an important clue is missing. Keep only information that helps answer the question.');
    }
    case 'predict':
      if (!value?.answer) return retry('Make a prediction using the observations shown.');
      return value.answer === answer.answer ? done(activity) : retry('A prediction should follow the observations. Check what the examples show, then try again.');
    case 'debug':
      if (!value?.fixId) return retry('Choose the correction that fixes the broken instruction.');
      return value.fixId === answer.fixId ? done(activity, 'Bug fixed! The corrected instruction now matches the task.') : retry('That change does not fix the problem. Compare the broken part with the intended result.');
    default:
      return retry(`The activity type “${activity.type}” does not have a validator yet.`);
  }
}

// Kept as a backwards-compatible named export for older integrations.
export const placeholderValidate = validateActivity;
