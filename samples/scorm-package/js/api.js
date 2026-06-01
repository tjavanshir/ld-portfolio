/*
 * SCORM 1.2 API Wrapper
 * Communicates with the LMS via the SCORM 1.2 JavaScript API.
 * In standalone mode (no LMS), all API calls are simulated.
 */

const SCORM = (() => {
  let api = null;
  let initialized = false;
  let standalone = false;
  const store = {};

  function findAPI(win) {
    let attempts = 0;
    while (!win.API && win.parent && win.parent !== win && attempts < 7) {
      win = win.parent;
      attempts++;
    }
    return win.API || null;
  }

  function init() {
    api = findAPI(window);
    if (!api) {
      standalone = true;
      console.info('[SCORM] No LMS API found — running in standalone/demo mode.');
      return true;
    }
    const result = api.LMSInitialize('');
    initialized = result === 'true' || result === true;
    if (!initialized) console.warn('[SCORM] LMSInitialize failed:', api.LMSGetLastError());
    return initialized;
  }

  function setValue(element, value) {
    store[element] = value;
    if (standalone) return true;
    if (!initialized) return false;
    const result = api.LMSSetValue(element, value);
    if (result !== 'true' && result !== true) {
      console.warn(`[SCORM] LMSSetValue(${element}) failed:`, api.LMSGetLastError());
    }
    return result === 'true' || result === true;
  }

  function getValue(element) {
    if (standalone) return store[element] || '';
    if (!initialized) return '';
    return api.LMSGetValue(element);
  }

  function commit() {
    if (standalone) return true;
    if (!initialized) return false;
    return api.LMSCommit('') === 'true';
  }

  function finish() {
    if (standalone) return true;
    if (!initialized) return false;
    const result = api.LMSFinish('');
    initialized = false;
    return result === 'true';
  }

  function setScore(raw, min, max) {
    setValue('cmi.core.score.raw', raw);
    setValue('cmi.core.score.min', min);
    setValue('cmi.core.score.max', max);
    commit();
  }

  function setCompletion(status) {
    // SCORM 1.2 lesson_status values: passed | failed | completed | incomplete | not attempted | browsed
    setValue('cmi.core.lesson_status', status);
    commit();
  }

  function setSessionTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const fmt = `${String(h).padStart(4,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    setValue('cmi.core.session_time', fmt);
  }

  return { init, setValue, getValue, commit, finish, setScore, setCompletion, setSessionTime, isStandalone: () => standalone };
})();

// Auto-init on load
window.addEventListener('load', () => SCORM.init());
window.addEventListener('beforeunload', () => SCORM.finish());
