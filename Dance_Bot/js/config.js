/* Teacher settings. Edit this file to tailor the lab to your class. No build step needed.
   Link parameters override a few of these, e.g.  index.html?mode=full&pack=moods&theme=light&camp=0 */
window.DL = window.DL || {};
DL.config = {
  title: 'Teach the Robot to Dance',

  /* 'junior'  = Years 5-6: fewer tabs, plain words, one friendly brain (look-alike finder), starter moves, 4 labels max.
     'full'    = Years 7+: both brains, Lab tab, all 50 moves, exam history and mix-up tables. */
  mode: 'junior',

  tutorial: 'auto',        // 'auto' = show the Training Camp welcome on a student's first visit | 'off'
  defaultPack: null,       // null = mode default (junior: moods, full: dance). Or dance | moods | animals | sports | order | blank
  allowPhotos: true,       // let students use a photo or drawing as the head. Photos stay on the device.
  soundDefault: false,
  theme: 'dark',           // dark | light

  /* Optional fine-tuning. Leave a value as null to use the mode's default. */
  overrides: {
    showBrainChoice: null, // true shows the brain switch
    defaultBrain: null,    // 'tree' | 'knn'
    maxLabels: null,
    maxMoves: null,
    showLab: null,         // true shows the Lab tab
    starterMovesOnly: null
  }
};
