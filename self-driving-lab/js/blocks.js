/* Self-Driving Lab — Blockly blocks, code generation and toolbox. */
(function (g) {
  'use strict';
  const SDL = (g.SDL = g.SDL || {});
  const B = (SDL.Blocks = {});
  const DRIVE = '#ff8a3d', SENSE = '#3aa0ff';

  B.init = function () {
    if (B.ready) return;
    B.ready = true;
    const G = Blockly.JavaScript;
    const define = (Blockly.common && Blockly.common.defineBlocksWithJsonArray) || Blockly.defineBlocksWithJsonArray;
    const act = { previousStatement: null, nextStatement: null, colour: DRIVE };
    const DIRS = [['ahead', 'ahead'], ['left', 'left'], ['right', 'right'], ['behind', 'behind']];
    define([
      { type: 'car_start', message0: 'when run is pressed', style: 'start_blocks', nextStatement: null, tooltip: 'Your program starts here.' },
      { type: 'car_forward', message0: 'drive forward %1 steps', args0: [{ type: 'input_value', name: 'STEPS', check: 'Number' }], tooltip: 'Drive forward. One step is one tile.', ...act },
      { type: 'car_turn', message0: 'turn %1', args0: [{ type: 'field_dropdown', name: 'DIR', options: [['left', 'left'], ['right', 'right']] }], tooltip: 'Turn 90 degrees on the spot.', ...act },
      { type: 'car_curve', message0: 'curve %1', args0: [{ type: 'field_dropdown', name: 'DIR', options: [['left', 'left'], ['right', 'right']] }], tooltip: 'Drive a smooth curve: one tile forward and one tile sideways, ending facing the new direction. Needs road on the diagonal tile.', ...act },
      { type: 'car_stop', message0: 'stop for a moment', tooltip: 'Hold still for half a second.', ...act },
      { type: 'car_brake', message0: 'brake (next drive is slow)', tooltip: 'Slow down: the next drive-forward block moves at crawling speed.', ...act },
      { type: 'sense_obstacle', message0: 'obstacle ahead?', output: 'Boolean', colour: SENSE, tooltip: 'Is something blocking the road in the next 1.5 tiles?' },
      { type: 'sense_pedestrian', message0: 'pedestrian ahead?', output: 'Boolean', colour: SENSE, tooltip: 'Is a person near the road in the next 2 tiles?' },
      { type: 'sense_light', message0: 'traffic light is %1', args0: [{ type: 'field_dropdown', name: 'C', options: [['red', 'red'], ['amber', 'amber'], ['green', 'green']] }], output: 'Boolean', colour: SENSE, tooltip: 'Reads the light ahead (visible within about 5 tiles).' },
      { type: 'sense_dest', message0: 'at destination?', output: 'Boolean', colour: SENSE, tooltip: 'Has the car reached the finish?' },
      { type: 'sense_distance', message0: 'distance to hazard ahead (tiles)', output: 'Number', colour: SENSE, tooltip: 'Tiles to the nearest obstacle or pedestrian ahead. 9 means nothing in range.' },
      {
        type: 'sense_detect', message0: '%1 %2 ?',
        args0: [{ type: 'field_dropdown', name: 'KIND', options: [['obstacle', 'obstacle'], ['pedestrian', 'pedestrian'], ['anything', 'any']] }, { type: 'field_dropdown', name: 'DIR', options: DIRS }],
        output: 'Boolean', colour: SENSE, tooltip: 'Sensors on every side of the car: is something within about 1.5 tiles in that direction?',
      },
      { type: 'sense_range', message0: 'distance %1 (tiles)', args0: [{ type: 'field_dropdown', name: 'DIR', options: DIRS }], output: 'Number', colour: SENSE, tooltip: 'Tiles to the nearest hazard in that direction. 9 means nothing in range.' },
      { type: 'sense_road', message0: 'road %1 ?', args0: [{ type: 'field_dropdown', name: 'DIR', options: DIRS }], output: 'Boolean', colour: SENSE, tooltip: 'Is there road on the next tile in that direction?' },
      { type: 'sense_junction', message0: 'at a junction?', output: 'Boolean', colour: SENSE, tooltip: 'True when the road continues in at least two of: ahead, left, right.' },
      {
        type: 'sense_facing', message0: 'facing %1 ?',
        args0: [{ type: 'field_dropdown', name: 'D', options: [['north', 'north'], ['east', 'east'], ['south', 'south'], ['west', 'west']] }],
        output: 'Boolean', colour: SENSE, tooltip: 'Compass: which way is the car pointing?',
      },
    ]);

    const ord = () => G.Order || { NONE: G.ORDER_NONE, FUNCTION_CALL: G.ORDER_FUNCTION_CALL };
    const set = (n, fn) => { G.forBlock[n] = fn; };
    set('car_start', () => '');
    set('car_forward', (b) => `yield* api.forward(${G.valueToCode(b, 'STEPS', ord().NONE) || '1'});\n`);
    set('car_turn', (b) => `yield* api.turn('${b.getFieldValue('DIR')}');\n`);
    set('car_curve', (b) => `yield* api.curve('${b.getFieldValue('DIR')}');\n`);
    set('car_stop', () => 'yield* api.stop();\n');
    set('car_brake', () => 'yield* api.brake();\n');
    const val = (code) => () => [code, ord().FUNCTION_CALL];
    set('sense_obstacle', val('api.obstacle()'));
    set('sense_pedestrian', val('api.pedestrian()'));
    set('sense_dest', val('api.dest()'));
    set('sense_distance', val('api.distance()'));
    set('sense_junction', val('api.junction()'));
    set('sense_light', (b) => [`api.light('${b.getFieldValue('C')}')`, ord().FUNCTION_CALL]);
    set('sense_detect', (b) => [`api.detect('${b.getFieldValue('KIND')}', '${b.getFieldValue('DIR')}')`, ord().FUNCTION_CALL]);
    set('sense_range', (b) => [`api.range('${b.getFieldValue('DIR')}')`, ord().FUNCTION_CALL]);
    set('sense_road', (b) => [`api.road('${b.getFieldValue('DIR')}')`, ord().FUNCTION_CALL]);
    set('sense_facing', (b) => [`api.facing('${b.getFieldValue('D')}')`, ord().FUNCTION_CALL]);

    G.addReservedWords('api');
    G.STATEMENT_PREFIX = 'api.hl(%1);\n';           // highlights the running block
    G.INFINITE_LOOP_TRAP = 'yield* api.tick();\n';  // every loop pass waits a frame, so loops can never freeze the page

    B.theme = Blockly.Theme.defineTheme('lab', {
      base: Blockly.Themes.Zelos, name: 'lab',
      blockStyles: {
        start_blocks: { colourPrimary: '#f2c14e', hat: 'cap' },
        logic_blocks: { colourPrimary: '#8b6cf0' }, loop_blocks: { colourPrimary: '#22b98a' }, math_blocks: { colourPrimary: '#5f6f95' },
      },
      componentStyles: {
        workspaceBackgroundColour: '#10172a', toolboxBackgroundColour: '#0c1222', toolboxForegroundColour: '#d8e0f0',
        flyoutBackgroundColour: '#172036', flyoutForegroundColour: '#ccd6ea', flyoutOpacity: 1,
        scrollbarColour: '#5c6b92', scrollbarOpacity: 0.5, insertionMarkerColour: '#ffffff', insertionMarkerOpacity: 0.3, cursorColour: '#ffd24a',
      },
      fontStyle: { family: 'Manrope, system-ui, sans-serif', weight: '700', size: 11 },
    });
  };

  const num = (n, v) => `<value name="${n}"><shadow type="math_number"><field name="NUM">${v}</field></shadow></value>`;
  const BLK = {
    forward: `<block type="car_forward">${num('STEPS', 1)}</block>`,
    turn: '<block type="car_turn"></block>', curve: '<block type="car_curve"></block>',
    stop: '<block type="car_stop"></block>', brake: '<block type="car_brake"></block>',
    obstacle: '<block type="sense_obstacle"></block>', pedestrian: '<block type="sense_pedestrian"></block>',
    light: '<block type="sense_light"></block>', distance: '<block type="sense_distance"></block>', dest: '<block type="sense_dest"></block>',
    detect: '<block type="sense_detect"></block>', range: '<block type="sense_range"></block>', road: '<block type="sense_road"></block>',
    junction: '<block type="sense_junction"></block>', facing: '<block type="sense_facing"></block>',
    if: '<block type="controls_if"></block>', ifelse: '<block type="controls_if"><mutation else="1"></mutation></block>',
    compare: `<block type="logic_compare"><field name="OP">LT</field>${num('B', 2)}</block><block type="math_number"><field name="NUM">1</field></block>`,
    andor: '<block type="logic_operation"></block>', not: '<block type="logic_negate"></block>',
    repeat: `<block type="controls_repeat_ext">${num('TIMES', 4)}</block>`, while: '<block type="controls_whileUntil"></block>',
  };
  const CATS = [
    ['Drive', DRIVE, ['forward', 'turn', 'curve', 'stop', 'brake']],
    ['Sense', SENSE, ['obstacle', 'pedestrian', 'light', 'distance', 'detect', 'range', 'road', 'junction', 'facing', 'dest']],
    ['Decide', '#8b6cf0', ['if', 'ifelse', 'compare', 'andor', 'not']], ['Repeat', '#22b98a', ['repeat', 'while']],
  ];

  B.toolbox = (keys) =>
    '<xml>' + CATS.map(([n, c, ks]) => {
      const k = ks.filter((x) => keys.includes(x));
      return k.length ? `<category name="${n}" colour="${c}">${k.map((x) => BLK[x]).join('')}</category>` : '';
    }).join('') + '</xml>';

  B.create = (div) =>
    Blockly.inject(div, {
      media: 'https://unpkg.com/blockly@10/media/', toolbox: B.toolbox(SDL.ALL_BLOCKS), theme: B.theme, renderer: 'zelos', sounds: false, trashcan: true,
      grid: { spacing: 24, length: 2, colour: '#1c2742', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.9, minScale: 0.5, maxScale: 1.6 },
    });

  // Only the stack under "when run is pressed" is executed.
  B.compile = (ws) => {
    const start = ws.getTopBlocks(true).find((b) => b.type === 'car_start');
    if (!start || !start.getNextBlock()) return null;
    const G = Blockly.JavaScript;
    G.init(ws);
    const code = G.blockToCode(start);
    return Array.isArray(code) ? code[0] : code;
  };

  B.stats = (ws) => {
    const start = ws.getTopBlocks(true).find((b) => b.type === 'car_start');
    const bs = start ? start.getDescendants(false).filter((b) => !b.isShadow() && b.type !== 'car_start') : [];
    return { blocks: bs.length, types: new Set(bs.map((b) => b.type)) };
  };
})(globalThis);