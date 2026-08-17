/*
 * SCORM 2004 API Wrapper - CAE Teacher CPD
 * Finds API_1484_11 in parent/opener frames; falls back to standalone demo mode.
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
      try { if (win.API_1484_11) return win.API_1484_11; } catch(e) {}
      try { if (win.parent && win.parent !== win) { win = win.parent; attempts++; continue; } } catch(e) {}
      break;
    }
    try { if (window.top && window.top.API_1484_11) return window.top.API_1484_11; } catch(e) {}
    try { if (window.opener && window.opener.API_1484_11) return window.opener.API_1484_11; } catch(e) {}
    return null;
  }

  function init() {
    api = findAPI(window);
    if (api) {
      const result = api.Initialize('');
      initialized = result === 'true' || result === true;
      if (initialized) {
        console.info('[SCORM 2004] LMS API connected.');
        setValue('cmi.completion_status', 'incomplete');
        commit();
      } else {
        console.warn('[SCORM 2004] Initialize failed:', api.GetLastError());
      }
      return initialized;
    }

    let retries = 0;
    const maxRetries = 15;
    const interval = setInterval(function () {
      api = findAPI(window);
      retries++;
      if (api) {
        clearInterval(interval);
        const result = api.Initialize('');
        initialized = result === 'true' || result === true;
        if (initialized) {
          console.info('[SCORM 2004] LMS API connected (retry ' + retries + ').');
          setValue('cmi.completion_status', 'incomplete');
          commit();
        } else {
          console.warn('[SCORM 2004] Initialize failed on retry:', api.GetLastError());
        }
      } else if (retries >= maxRetries) {
        clearInterval(interval);
        standalone = true;
        console.info('[SCORM 2004] No LMS API found after retries - running in standalone/demo mode.');
      }
    }, 200);

    return true;
  }

  function setValue(element, value) {
    store[element] = value;
    if (standalone) return true;
    if (!initialized) return false;
    const result = api.SetValue(element, String(value));
    if (result !== 'true' && result !== true) {
      console.warn('[SCORM 2004] SetValue(' + element + ') failed:', api.GetLastError());
    }
    return result === 'true' || result === true;
  }

  function getValue(element) {
    if (standalone) return store[element] || '';
    if (!initialized) return '';
    return api.GetValue(element);
  }

  function commit() {
    if (standalone) return true;
    if (!initialized) return false;
    return api.Commit('') === 'true';
  }

  function finish() {
    if (standalone) return true;
    if (!initialized) return false;
    commit();
    const result = api.Terminate('');
    initialized = false;
    return result === 'true';
  }

  function _fmtTime(seconds) {
    const s = Math.max(0, Math.round(seconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    let out = 'PT';
    if (h) out += h + 'H';
    if (m) out += m + 'M';
    out += sec + 'S';
    return out;
  }

  function _nowISO() {
    return new Date().toISOString();
  }

  function _truncate(str, max) {
    return (str || '').toString().substring(0, max);
  }

  function _scaled(raw, min, max) {
    const lo = min !== undefined ? Number(min) : 0;
    const hi = max !== undefined ? Number(max) : 100;
    const val = Number(raw);
    if (!isFinite(val) || hi === lo) return 0;
    return Math.max(0, Math.min(1, (val - lo) / (hi - lo))).toFixed(4);
  }

  function setScore(raw, min, max) {
    const lo = min !== undefined ? min : 0;
    const hi = max !== undefined ? max : 100;
    setValue('cmi.score.raw', raw);
    setValue('cmi.score.min', lo);
    setValue('cmi.score.max', hi);
    setValue('cmi.score.scaled', _scaled(raw, lo, hi));
    commit();
  }

  function setCompletion(status) {
    if (status === 'passed') {
      setValue('cmi.completion_status', 'completed');
      setValue('cmi.success_status', 'passed');
    } else if (status === 'failed') {
      setValue('cmi.completion_status', 'completed');
      setValue('cmi.success_status', 'failed');
    } else if (status === 'completed') {
      setValue('cmi.completion_status', 'completed');
    } else if (status === 'incomplete') {
      setValue('cmi.completion_status', 'incomplete');
    } else {
      setValue('cmi.completion_status', 'unknown');
    }
    commit();
  }

  function setSessionTime(seconds) {
    setValue('cmi.session_time', _fmtTime(seconds));
  }

  function setLocation(loc) {
    setValue('cmi.location', _truncate(loc, 1000));
    commit();
  }

  function setSuspendData(data) {
    setValue('cmi.suspend_data', _truncate(data, 64000));
    commit();
  }

  function getSuspendData() {
    return getValue('cmi.suspend_data');
  }

  function logInteraction(id, type, response, correctPattern, result, latency) {
    const n = _interactionCount++;
    const base = 'cmi.interactions.' + n + '.';
    setValue(base + 'id', _truncate(id, 250));
    setValue(base + 'type', type);
    setValue(base + 'learner_response', _truncate(response, 250));
    setValue(base + 'correct_responses.0.pattern', _truncate(correctPattern, 250));
    setValue(base + 'result', result === 'wrong' ? 'incorrect' : result);
    setValue(base + 'timestamp', _nowISO());
    setValue(base + 'latency', _fmtTime(latency));
    setValue(base + 'weighting', '1');
    commit();
  }

  function logObjective(id, status, raw, min, max) {
    const n = _objectiveCount++;
    const base = 'cmi.objectives.' + n + '.';
    const lo = min !== undefined ? min : 0;
    const hi = max !== undefined ? max : 100;
    setValue(base + 'id', _truncate(id, 250));
    setValue(base + 'completion_status', 'completed');
    if (status === 'passed' || status === 'failed') setValue(base + 'success_status', status);
    setValue(base + 'score.raw', raw);
    setValue(base + 'score.min', lo);
    setValue(base + 'score.max', hi);
    setValue(base + 'score.scaled', _scaled(raw, lo, hi));
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
