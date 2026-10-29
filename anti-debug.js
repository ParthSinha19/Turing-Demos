/**
 * anti-debug.js
 * Lightweight deterrent script to discourage semi-casual DevTools inspection 
 * during classroom and workshop demos.
 */

(function () {
  // 1. Disable Right-Click Context Menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // 2. Disable DevTools and Source Shortcuts
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
    }
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Windows/Linux) or Cmd+Option+I/J/C (Mac)
    if (
      (e.ctrlKey || e.metaKey) &&
      e.shiftKey &&
      ['I', 'J', 'C'].includes(e.key.toUpperCase())
    ) {
      e.preventDefault();
    }
    // Ctrl+U / Cmd+U (View Source)
    if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'U') {
      e.preventDefault();
    }
  });

  // 3. Performance Trap / Debugger Pause Loop
  // If DevTools is open, the 'debugger' statement pauses execution,
  // causing the interval duration to spike.
  setInterval(() => {
    const startTime = performance.now();
    
    // This triggers a breakpoint break when DevTools is active
    (function () {}.constructor('debugger')());
    
    const endTime = performance.now();

    // If execution was paused for more than 100ms, clear out console noise
    if (endTime - startTime > 100) {
      console.clear();
    }
  }, 1500);

  // 4. Clean up Console in Production
  // (Optional: keeps the console relatively clear of internal logs if desired)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Uncomment the lines below if you want to completely mute console.log in production
    /*
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    */
    console.clear();
  }
})();