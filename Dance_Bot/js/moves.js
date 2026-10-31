/* The move vocabulary. Each move: id, name, emoji, category, and two pose frames
   [leftArm, rightArm, leftLeg, rightLeg, lift, tilt, flip] (degrees / px / scaleX).
   Order matters: the 14 starter moves come first, interleaved across categories so the first grid is
   a rainbow, then the rest sit in category blocks. Move ids never change, so packs and saved projects keep working. */
(function () {
  'use strict';
  const DL = (window.DL = window.DL || {});
  const RAW = [
    /* ---- starter moves, mixed so every row is colourful ---- */
    ['clap', 'Clap', '👏', 'arms', [75, 75, 6, 6, 0, 0], [25, 25, 6, 6, 0, 0]],
    ['jump', 'Jump', '🦘', 'legs', [60, 60, 4, 4, 6, 0], [140, 140, 18, 18, -34, 0]],
    ['spin', 'Spin', '🌀', 'body', [100, 100, 6, 6, 0, 0, 1], [100, 100, 6, 6, 0, 0, -1]],
    ['robotarms', 'Robot arms', '🤖', 'char', [90, 180, 6, 6, 0, 0], [180, 90, 6, 6, 0, 0]],
    ['disco', 'Disco point', '🪩', 'dance', [8, 160, 8, 8, 0, 0], [160, 8, 8, 8, 0, 0]],
    ['wave', 'Wave', '👋', 'arms', [8, 150, 6, 6, 0, 0], [8, 115, 6, 6, 0, 0]],
    ['stomp', 'Stomp', '🦶', 'legs', [30, 30, 40, 4, -6, 0], [30, 30, 4, 40, -6, 0]],
    ['sway', 'Sway', '🌊', 'body', [40, 40, 8, 8, 0, -8], [40, 40, 8, 8, 0, 8]],
    ['wobble', 'Wobble', '🍮', 'char', [60, 60, 10, 10, 0, -10], [60, 60, 10, 10, 0, 10]],
    ['shuffle', 'Shuffle', '👟', 'dance', [30, 30, 30, 4, -4, -3], [30, 30, 4, 30, -4, 3]],
    ['reachup', 'Reach up', '☝️', 'arms', [175, 175, 6, 6, 0, 0], [165, 165, 6, 6, -6, 0]],
    ['freeze', 'Freeze', '🧊', 'body', [100, 45, 10, 10, 0, 0], [100, 45, 10, 10, 0, 0]],
    ['sleepy', 'Sleepy sway', '😴', 'char', [10, 10, 6, 6, 6, -10], [10, 10, 6, 6, 10, 10]],
    ['bounce', 'Bounce', '⚽', 'body', [40, 40, 8, 8, 6, 0], [40, 40, 8, 8, -14, 0]],

    /* ---- hands and arms ---- */
    ['jazz', 'Jazz hands', '🙌', 'arms', [140, 140, 8, 8, 0, 0], [120, 120, 8, 8, -3, 0]],
    ['snap', 'Finger snap', '🤏', 'arms', [8, 100, 6, 6, 0, 0], [8, 80, 6, 6, -3, 0]],
    ['pointL', 'Point left', '👈', 'arms', [90, 8, 8, 6, 0, -3], [100, 8, 8, 6, 0, -5]],
    ['pointR', 'Point right', '👉', 'arms', [8, 90, 6, 8, 0, 3], [8, 100, 6, 8, 0, 5]],
    ['punch', 'Punch the air', '👊', 'arms', [75, 8, 6, 6, 0, -4], [8, 75, 6, 6, 0, 4]],
    ['armcircle', 'Arm circle', '🔄', 'arms', [90, 90, 6, 6, 0, 0], [180, 180, 6, 6, 0, 0]],
    ['crossarms', 'Cross arms', '🙅', 'arms', [-40, -40, 6, 6, 0, 0], [-30, -30, 6, 6, 0, 0]],
    ['hips', 'Hands on hips', '💁', 'arms', [38, 38, 8, 8, 0, 0], [44, 44, 8, 8, 0, 0]],

    /* ---- feet and legs ---- */
    ['hop', 'Hop', '🐇', 'legs', [30, 30, 2, 40, -2, 0], [30, 30, 2, 40, -26, 0]],
    ['tiptoe', 'Tiptoe', '👣', 'legs', [100, 100, 3, 3, -10, 0], [110, 110, 3, 3, -14, 0]],
    ['kick', 'Kick', '🥋', 'legs', [20, 20, 6, 70, 0, -4], [20, 20, 6, 10, 0, 0]],
    ['stepL', 'Side-step left', '⬅️', 'legs', [30, 30, 45, 4, 0, -4], [20, 20, 6, 6, 0, 0]],
    ['stepR', 'Side-step right', '➡️', 'legs', [30, 30, 4, 45, 0, 4], [20, 20, 6, 6, 0, 0]],
    ['march', 'March', '🥁', 'legs', [40, 10, 45, 4, -4, 0], [10, 40, 4, 45, -4, 0]],
    ['squat', 'Squat', '🏋️', 'legs', [60, 60, 30, 30, 18, 0], [50, 50, 34, 34, 24, 0]],
    ['kneelift', 'Knee lift', '🦵', 'legs', [30, 30, 6, 60, -4, 0], [30, 30, 60, 6, -4, 0]],
    ['skip', 'Skip', '🏃', 'legs', [60, 20, 50, 4, -14, 0], [20, 60, 4, 50, -6, 0]],

    /* ---- whole body ---- */
    ['twirl', 'Twirl', '🌪️', 'body', [160, 160, 4, 4, -8, 0, -1], [160, 160, 4, 4, -8, 0, 1]],
    ['wiggle', 'Wiggle', '🪱', 'body', [50, 30, 8, 8, 0, -6], [30, 50, 8, 8, 0, 6]],
    ['shimmy', 'Shimmy', '✨', 'body', [70, 70, 8, 8, 0, -4], [70, 70, 8, 8, 0, 4]],
    ['leanL', 'Lean left', '↙️', 'body', [30, 30, 8, 8, 0, -18], [30, 30, 8, 8, 0, -22]],
    ['leanR', 'Lean right', '↘️', 'body', [30, 30, 8, 8, 0, 18], [30, 30, 8, 8, 0, 22]],
    ['crouch', 'Crouch', '🐱', 'body', [20, 20, 30, 30, 24, 0], [20, 20, 30, 30, 28, 0]],
    ['stretch', 'Stretch', '🙆', 'body', [175, 175, 20, 20, -6, 0], [175, 175, 20, 20, -14, 0]],
    ['balance', 'Balance', '⚖️', 'body', [90, 90, 3, 70, -2, 0], [95, 95, 3, 75, -2, 0]],

    /* ---- silly and characters ---- */
    ['fly', 'Pretend to fly', '🦅', 'char', [150, 150, 10, 10, -20, 0], [100, 100, 10, 10, -30, 0]],
    ['sneak', 'Sneak', '🥷', 'char', [30, 10, 20, 4, 10, -6], [10, 30, 4, 20, 10, 6]],
    ['hero', 'Superhero pose', '🦸', 'char', [40, 175, 24, 24, -2, 0], [40, 170, 24, 24, -4, 0]],
    ['monster', 'Monster stomp', '👹', 'char', [110, 110, 40, 4, -4, -3], [110, 110, 4, 40, -4, 3]],
    ['silly', 'Silly shake', '🤪', 'char', [150, 40, 20, 50, 0, -8], [40, 150, 50, 20, 0, 8]],
    ['rope', 'Invisible jump rope', '➰', 'char', [50, 50, 4, 4, 0, 0], [50, 50, 4, 4, -22, 0]],

    /* ---- dance floor ---- */
    ['grapevine', 'Grapevine', '🍇', 'dance', [60, 60, 40, 4, 0, -6], [60, 60, 4, 40, 0, 6]],
    ['salsa', 'Salsa step', '💃', 'dance', [60, 60, 25, 25, 0, -8], [60, 60, 6, 6, 0, 8]],
    ['ballet', 'Ballet turn', '🩰', 'dance', [150, 150, 3, 60, -8, 0, 1], [150, 150, 3, 60, -8, 0, -1]],
    ['moonwalk', 'Moonwalk slide', '🌙', 'dance', [20, 50, 30, 4, 0, 6], [50, 20, 4, 30, 0, 6]],
    ['celebrate', 'Celebrate', '🎉', 'dance', [160, 160, 15, 15, -18, 0], [140, 140, 10, 10, -30, 0]]
  ];
  const list = RAW.map(([id, name, icon, cat, a, b], i) => ({ id, name, icon, cat, a, b, idx: i }));
  DL.Moves = {
    list,
    byId: Object.fromEntries(list.map(m => [m.id, m])),
    STARTERS: new Set(['clap', 'wave', 'reachup', 'jump', 'stomp', 'spin', 'sway', 'freeze', 'bounce', 'robotarms', 'wobble', 'disco', 'shuffle', 'sleepy']),
    CATC: { arms: '#ff3d9a', legs: '#27e1ff', body: '#ffe03d', char: '#b78bff', dance: '#7dff8a' },
    CATS: [['starter', '⭐ Starter set'], ['arms', '🙌 Hands & arms'], ['legs', '🦵 Feet & legs'], ['body', '🕺 Whole body'], ['char', '🤪 Silly & characters'], ['dance', '🪩 Dance floor'], ['all', '🎪 All moves']],
    REST: [12, 12, 6, 6, 0, 0, 1]
  };
})();
