/* Label packs: ready-made sets of labels with training examples and a separate fair exam.
   Students can start from a pack and then edit, rename, recolour, add or delete anything,
   or start from the Blank pack and design every label themselves. */
(function () {
  'use strict';
  const DL = (window.DL = window.DL || {});

  const PALETTE = ['#a58bff', '#ffd23f', '#35d6f0', '#ff5aa5', '#6df29a', '#ff8a3d', '#5b8cff', '#ff6a6a', '#c9f24a', '#f08fff'];
  const EMOJI = ['🦸', '👽', '😴', '🤖', '🐱', '🐸', '🐦', '🥊', '🏃', '🤸', '😄', '😠', '🚀', '🛬', '🌊', '🔥', '⚡', '🌈', '🎃', '👻', '🦄', '🐙', '🍕', '🎸', '🥁', '⭐', '💎', '🧊', '🌋', '🪩', '🧟', '🧙', '🦖', '🐧', '🐝', '🦊', '🌵', '🍀', '👑', '🎈'];

  const PACKS = [
    {
      id: 'dance', name: 'Dance styles', icon: '🪩',
      blurb: 'Alien Shuffle, Superhero Groove and Sleepy Robot. The classic starter.',
      labels: [
        { name: 'Alien Shuffle', icon: '👽', color: '#a58bff', rule: 'Wobbly, robotic arms, then freeze',
          ex: ['wobble robotarms freeze wobble', 'robotarms wobble freeze robotarms wobble', 'wobble robotarms wobble freeze', 'robotarms freeze wobble robotarms'],
          exam: ['wobble freeze robotarms robotarms wobble', 'robotarms wobble wobble freeze', 'wobble robotarms hero freeze'] },
        { name: 'Superhero Groove', icon: '🦸', color: '#ffd23f', rule: 'Hero poses, big jumps and reaching up',
          ex: ['hero jump reachup freeze', 'hero reachup jump hero', 'jump hero reachup celebrate', 'hero bounce jump reachup'],
          exam: ['hero jump jump reachup', 'reachup hero freeze jump'] },
        { name: 'Sleepy Robot', icon: '😴', color: '#35d6f0', rule: 'Slow sways, stretches and crouching',
          ex: ['sway stretch sway crouch', 'sleepy sway crouch sleepy', 'stretch sleepy sway crouch', 'sway sleepy sway stretch'],
          exam: ['sleepy sleepy sway stretch', 'crouch sleepy sway sleepy'] }
      ]
    },
    {
      id: 'moods', name: 'Moods', icon: '😄',
      blurb: 'Can a robot tell how a dancer feels from the moves alone?',
      labels: [
        { name: 'Happy', icon: '😄', color: '#ffd23f', rule: 'Big, bouncy, arms up',
          ex: ['celebrate jump jazz clap', 'bounce jazz celebrate jump', 'clap jump reachup celebrate', 'jazz bounce clap celebrate'],
          exam: ['jump celebrate clap bounce', 'reachup jazz jump clap'] },
        { name: 'Sleepy', icon: '😴', color: '#35d6f0', rule: 'Slow and droopy',
          ex: ['sleepy sway stretch crouch', 'sway sleepy crouch sleepy', 'stretch sleepy sway crouch', 'crouch sleepy stretch sway'],
          exam: ['sleepy sleepy crouch sway', 'stretch crouch sleepy sway'] },
        { name: 'Grumpy', icon: '😠', color: '#ff6a6a', rule: 'Stomping with folded arms',
          ex: ['stomp crossarms monster stomp', 'crossarms stomp punch monster', 'monster stomp hips crossarms', 'punch stomp crossarms stomp'],
          exam: ['stomp monster crossarms punch', 'hips stomp monster stomp'] }
      ]
    },
    {
      id: 'animals', name: 'Animal moves', icon: '🐸',
      blurb: 'Birds, frogs and cats. Which moves give each animal away?',
      labels: [
        { name: 'Bird', icon: '🐦', color: '#5b8cff', rule: 'Flying with arms out wide',
          ex: ['fly wave reachup fly', 'reachup fly jazz fly', 'fly fly wave jazz', 'wave fly reachup jazz'],
          exam: ['fly reachup wave fly', 'jazz fly fly reachup'] },
        { name: 'Frog', icon: '🐸', color: '#6df29a', rule: 'Squat, then jump',
          ex: ['squat jump squat hop', 'hop hop jump squat', 'crouch jump hop jump', 'squat hop jump crouch'],
          exam: ['jump squat hop hop', 'hop crouch jump squat'] },
        { name: 'Cat', icon: '🐱', color: '#ff8a3d', rule: 'Sneaking, stretching and balancing',
          ex: ['sneak crouch stretch sneak', 'crouch sneak balance stretch', 'stretch sneak crouch sneak', 'sneak balance crouch stretch'],
          exam: ['sneak sneak stretch crouch', 'balance sneak crouch stretch'] }
      ]
    },
    {
      id: 'sports', name: 'Sports', icon: '🥊',
      blurb: 'Boxers, runners and gymnasts, each with their own moves.',
      labels: [
        { name: 'Boxer', icon: '🥊', color: '#ff6a6a', rule: 'Punching and hopping on the spot',
          ex: ['punch hop punch stomp', 'hop punch punch hop', 'punch stomp hop punch', 'hop hop punch stomp'],
          exam: ['punch punch hop stomp', 'stomp hop punch hop'] },
        { name: 'Runner', icon: '🏃', color: '#6df29a', rule: 'Marching, skipping, knees up',
          ex: ['march skip kneelift march', 'skip skip march kneelift', 'kneelift march skip skip', 'march kneelift skip march'],
          exam: ['skip march march kneelift', 'kneelift skip march skip'] },
        { name: 'Gymnast', icon: '🤸', color: '#ff5aa5', rule: 'Spins, turns and balancing',
          ex: ['ballet spin balance stretch', 'spin ballet stretch balance', 'balance ballet spin twirl', 'twirl spin ballet balance'],
          exam: ['ballet twirl balance stretch', 'spin balance ballet twirl'] }
      ]
    },
    {
      id: 'order', name: 'Order puzzle', icon: '🔀',
      blurb: 'Same moves, different order. Does the robot notice? Great for talking about sequences.',
      labels: [
        { name: 'Launch', icon: '🚀', color: '#ff8a3d', rule: 'Crouch first, THEN jump',
          ex: ['crouch jump celebrate', 'squat jump reachup', 'crouch jump fly', 'squat jump jazz'],
          exam: ['crouch jump freeze', 'squat jump bounce'] },
        { name: 'Landing', icon: '🛬', color: '#35d6f0', rule: 'Jump first, THEN crouch',
          ex: ['jump crouch freeze', 'jump squat sway', 'celebrate jump crouch', 'jump squat balance'],
          exam: ['jump crouch stretch', 'fly jump squat'] }
      ]
    },
    {
      id: 'blank', name: 'Blank slate', icon: '✏️',
      blurb: 'No labels at all. Invent your own and teach the robot from scratch.',
      labels: []
    }
  ];

  /* Used by Training Camp. Hidden from the pack list. Starter moves only, with a tiny quiz. */
  PACKS.push({
    id: 'camp', hidden: true, name: 'Training camp', icon: '🎓', blurb: '',
    labels: [
      { name: 'Happy', icon: '😄', color: '#ffd23f', rule: 'Big, bouncy, arms up',
        ex: ['jump clap bounce', 'clap jump reachup bounce', 'bounce jump clap reachup'], exam: ['jump bounce reachup clap'] },
      { name: 'Sleepy', icon: '😴', color: '#35d6f0', rule: 'Slow and droopy',
        ex: ['sleepy sway freeze', 'sway sleepy sway freeze', 'sleepy freeze sway sleepy'], exam: ['sleepy sway sway freeze'] }
    ]
  });
  DL.Packs = PACKS;
  DL.Packs.PALETTE = PALETTE;
  DL.Packs.EMOJI = EMOJI;
  DL.Packs.get = id => PACKS.find(p => p.id === id);
})();
