/* SCORM Module Logic — Writing Effective Learning Objectives */

const TOTAL = document.querySelectorAll('.slide').length;
let current = 0;
let startTime = Date.now();
let quizDone = false;

// SCORM status banner
function updateSCORMBanner() {
  const banner = document.getElementById('scormBanner');
  if (!banner) return;
  if (SCORM.isStandalone()) {
    banner.innerHTML = '⚠️ <strong>Demo Mode:</strong> No LMS connected. SCORM tracking is simulated. Upload the ZIP to a SCORM-compliant LMS to track real data.';
    banner.style.display = 'block';
  }
}

function goTo(n) {
  document.querySelectorAll('.slide')[current].classList.remove('active');
  current = n;
  document.querySelectorAll('.slide')[current].classList.add('active');
  updateNav();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Report progress to SCORM
  const pct = Math.round(((current + 1) / TOTAL) * 100);
  SCORM.setValue('cmi.core.lesson_location', current.toString());
  if (current === TOTAL - 1) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    SCORM.setSessionTime(elapsed);
    if (!quizDone) SCORM.setCompletion('incomplete');
    SCORM.commit();
  }
}

function updateNav() {
  const pct = Math.round(((current + 1) / TOTAL) * 100);
  document.getElementById('pFill').style.width = pct + '%';
  document.getElementById('pText').textContent = pct + '% complete';
  document.getElementById('sCounter').textContent = `Slide ${current + 1} of ${TOTAL}`;
  document.getElementById('bPrev').disabled = current === 0;
  document.getElementById('bNext').textContent = current >= TOTAL - 1 ? 'Finish' : 'Next →';
}

document.getElementById('bPrev').addEventListener('click', () => { if (current > 0) goTo(current - 1); });
document.getElementById('bNext').addEventListener('click', () => { if (current < TOTAL - 1) goTo(current + 1); });

// Accordion
document.querySelectorAll('.accordion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.accordion-item');
    const isOpen = item.classList.contains('open');
    btn.closest('.accordion').querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const g = btn.closest('.tabs');
    g.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    g.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    g.querySelector('#' + btn.dataset.tab).classList.add('active');
  });
});

// Quiz
const questions = [
  {
    q: "Which Bloom's Taxonomy level does the verb 'compare' belong to?",
    opts: ["Remember", "Understand", "Analyse", "Create"],
    correct: 2,
    explain: "'Compare' is an Analyse-level verb — learners must break down concepts and examine their similarities and differences. Other Analyse verbs include differentiate, examine, and organise."
  },
  {
    q: "Which of the following is the BEST learning objective?",
    opts: [
      "Learners will understand the importance of safety.",
      "Participants will be exposed to safety concepts.",
      "By the end of this module, employees will be able to demonstrate correct PPE selection for three common hazards.",
      "This training covers workplace safety procedures."
    ],
    correct: 2,
    explain: "Option C uses a measurable Bloom's verb ('demonstrate'), specifies the audience (employees), includes a condition (end of module), and has a degree (three common hazards). The others are vague and unmeasurable."
  },
  {
    q: "The ABCD model for learning objectives stands for:",
    opts: [
      "Audience, Behaviour, Condition, Degree",
      "Activity, Bloom's, Criteria, Design",
      "Analysis, Blueprint, Content, Delivery",
      "Aim, Build, Check, Deploy"
    ],
    correct: 0,
    explain: "ABCD = Audience (who), Behaviour (what measurable action), Condition (under what circumstances), Degree (how well or how many). This structure ensures objectives are clear and assessable."
  },
  {
    q: "A learning objective at the 'Create' level of Bloom's Taxonomy requires learners to:",
    opts: [
      "Recall a list of facts from memory",
      "Explain a concept in their own words",
      "Judge the quality of a design against given criteria",
      "Produce an original work or solution"
    ],
    correct: 3,
    explain: "The 'Create' level (highest in Bloom's) requires learners to synthesise information to produce something new — a plan, a design, a solution. Verbs include: design, develop, construct, compose, produce."
  }
];

let answers = {};

function buildQuiz() {
  const c = document.getElementById('quizWrap');
  if (!c) return;
  c.innerHTML = questions.map((q, qi) => `
    <div class="sq" id="sq${qi}">
      <p class="sq-q"><span class="sq-num">Q${qi+1}</span> ${q.q}</p>
      <div class="sq-opts">
        ${q.opts.map((o, oi) => `
          <label class="sq-opt" data-q="${qi}" data-o="${oi}">
            <span class="sq-letter">${String.fromCharCode(65+oi)}</span>
            <span>${o}</span>
          </label>
        `).join('')}
      </div>
      <div class="sq-explain" id="exp${qi}"></div>
      <button class="sq-btn" data-q="${qi}" disabled>Check Answer</button>
    </div>
  `).join('');

  c.querySelectorAll('.sq-opt').forEach(lbl => {
    lbl.addEventListener('click', () => {
      const qi = lbl.dataset.q;
      if (answers[qi] !== undefined) return;
      c.querySelectorAll(`.sq-opt[data-q="${qi}"]`).forEach(l => l.classList.remove('sel'));
      lbl.classList.add('sel');
      c.querySelector(`.sq-btn[data-q="${qi}"]`).disabled = false;
    });
  });

  c.querySelectorAll('.sq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qi = parseInt(btn.dataset.q);
      if (answers[qi] !== undefined) return;
      const sel = c.querySelector(`.sq-opt[data-q="${qi}"].sel`);
      if (!sel) return;
      const oi = parseInt(sel.dataset.o);
      const correct = oi === questions[qi].correct;
      answers[qi] = correct ? 1 : 0;

      c.querySelectorAll(`.sq-opt[data-q="${qi}"]`).forEach(l => {
        if (parseInt(l.dataset.o) === questions[qi].correct) l.classList.add('right');
      });
      if (!correct) sel.classList.add('wrong');

      const exp = document.getElementById(`exp${qi}`);
      exp.textContent = questions[qi].explain;
      exp.className = `sq-explain show ${correct ? 'cor' : 'inc'}`;
      btn.disabled = true;

      if (Object.keys(answers).length === questions.length) submitScore();
    });
  });
}

function submitScore() {
  quizDone = true;
  const raw = Object.values(answers).reduce((a, b) => a + b, 0);
  const max = questions.length;
  const pct = Math.round((raw / max) * 100);
  const passed = pct >= 70;

  SCORM.setScore(pct, 0, 100);
  SCORM.setCompletion(passed ? 'passed' : 'failed');
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  SCORM.setSessionTime(elapsed);
  SCORM.commit();

  const panel = document.getElementById('resultPanel');
  document.getElementById('rScore').textContent = raw;
  document.getElementById('rTotal').textContent = max;
  document.getElementById('rPct').textContent = pct + '%';
  document.getElementById('rStatus').textContent = passed ? '✅ Passed' : '❌ Not yet passed';
  document.getElementById('rStatus').style.color = passed ? '#10B981' : '#EF4444';
  document.getElementById('rMsg').textContent = passed
    ? 'Great work! You have demonstrated a solid understanding of writing effective learning objectives.'
    : `You scored ${pct}%. A score of 70% or above is required to pass. Review the content and try again.`;
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
}

buildQuiz();
updateSCORMBanner();
updateNav();
