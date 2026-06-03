/*
 * SCORM 1.2 API Wrapper — CAE Teacher CPD
 * Finds the LMS API in parent frames; falls back to standalone demo mode.
 */

const SCORM = (() => {
  let api = null;
  let initialized = false;
  let standalone = false;
  const store = {};
  let _interactionCount = 0;
  let _objectiveCount = 0;

  function findAPI(win) {
    let attempts = 0;
    while (attempts < 7) {
      try { if (win.API) return win.API; } catch(e) {}
      try { if (win.parent && win.parent !== win) { win = win.parent; attempts++; continue; } } catch(e) {}
      break;
    }
    try { if (window.top && window.top.API) return window.top.API; } catch(e) {}
    try { if (window.opener && window.opener.API) return window.opener.API; } catch(e) {}
    return null;
  }

  function init() {
    api = findAPI(window);
    if (api) {
      const result = api.LMSInitialize('');
      initialized = result === 'true' || result === true;
      if (initialized) {
        console.info('[SCORM] LMS API connected.');
      } else {
        console.warn('[SCORM] LMSInitialize failed:', api.LMSGetLastError());
      }
      return initialized;
    }

    /* Retry loop — SCORM Cloud popup launches attach the API after the SCO loads */
    let retries = 0;
    const maxRetries = 15;
    const interval = setInterval(function () {
      api = findAPI(window);
      retries++;
      if (api) {
        clearInterval(interval);
        const result = api.LMSInitialize('');
        initialized = result === 'true' || result === true;
        if (initialized) {
          console.info('[SCORM] LMS API connected (retry ' + retries + ').');
        } else {
          console.warn('[SCORM] LMSInitialize failed on retry:', api.LMSGetLastError());
        }
      } else if (retries >= maxRetries) {
        clearInterval(interval);
        standalone = true;
        console.info('[SCORM] No LMS API found after retries — running in standalone/demo mode.');
      }
    }, 200);

    return true;
  }

  function setValue(element, value) {
    store[element] = value;
    if (standalone) return true;
    if (!initialized) return false;
    const result = api.LMSSetValue(element, value);
    if (result !== 'true' && result !== true) {
      console.warn('[SCORM] LMSSetValue(' + element + ') failed:', api.LMSGetLastError());
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

  function _fmtTime(seconds) {
    const s = Math.max(0, Math.round(seconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return String(h).padStart(4, '0') + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }

  function _nowHHMMSS() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' +
           String(d.getMinutes()).padStart(2, '0') + ':' +
           String(d.getSeconds()).padStart(2, '0');
  }

  function _truncate(str, max) {
    return (str || '').toString().substring(0, max);
  }

  function setScore(raw, min, max) {
    setValue('cmi.core.score.raw', raw);
    setValue('cmi.core.score.min', min !== undefined ? min : 0);
    setValue('cmi.core.score.max', max !== undefined ? max : 100);
    commit();
  }

  function setCompletion(status) {
    setValue('cmi.core.lesson_status', status);
    commit();
  }

  function setSessionTime(seconds) {
    setValue('cmi.core.session_time', _fmtTime(seconds));
  }

  function setLocation(loc) {
    setValue('cmi.core.lesson_location', _truncate(loc, 255));
    commit();
  }

  function setSuspendData(data) {
    setValue('cmi.suspend_data', _truncate(data, 4096));
    commit();
  }

  function getSuspendData() {
    return getValue('cmi.suspend_data');
  }

  /*
   * logInteraction — records a single learner response.
   * type:    'choice' | 'true-false' | 'fill-in' | 'matching'
   * response / correctPattern: human-readable strings (truncated to 255 chars)
   * result:  'correct' | 'wrong'
   * latency: seconds (number)
   */
  function logInteraction(id, type, response, correctPattern, result, latency) {
    const n = _interactionCount++;
    const base = 'cmi.interactions.' + n + '.';
    setValue(base + 'id',                          _truncate(id, 255));
    setValue(base + 'type',                        type);
    setValue(base + 'student_response',            _truncate(response, 255));
    setValue(base + 'correct_responses.0.pattern', _truncate(correctPattern, 255));
    setValue(base + 'result',                      result);
    setValue(base + 'time',                        _nowHHMMSS());
    setValue(base + 'latency',                     _fmtTime(latency));
    setValue(base + 'weighting',                   '1');
    commit();
  }

  /*
   * logObjective — records a module/quiz objective result.
   * status: 'passed' | 'failed' | 'completed' | 'incomplete'
   */
  function logObjective(id, status, raw, min, max) {
    const n = _objectiveCount++;
    const base = 'cmi.objectives.' + n + '.';
    setValue(base + 'id',         _truncate(id, 255));
    setValue(base + 'status',     status);
    setValue(base + 'score.raw',  raw);
    setValue(base + 'score.min',  min !== undefined ? min : 0);
    setValue(base + 'score.max',  max !== undefined ? max : 100);
    commit();
  }

  return {
    init,
    setValue,
    getValue,
    commit,
    finish,
    setScore,
    setCompletion,
    setSessionTime,
    setLocation,
    setSuspendData,
    getSuspendData,
    logInteraction,
    logObjective,
    isStandalone: function () { return standalone; }
  };
})();

window.addEventListener('load', function () { SCORM.init(); });
window.addEventListener('beforeunload', function () { SCORM.finish(); });
