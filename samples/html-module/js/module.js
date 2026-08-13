/* HTML5 Module Logic */

const TOTAL_SLIDES = document.querySelectorAll('.slide').length;
let currentSlide = 0;
let quizAnswered = {};

const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const slideCounter = document.getElementById('slideCounter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function goToSlide(n) {
  document.querySelectorAll('.slide')[currentSlide].classList.remove('active');
  currentSlide = n;
  document.querySelectorAll('.slide')[currentSlide].classList.add('active');
  updateUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateUI() {
  const pct = Math.round(((currentSlide + 1) / TOTAL_SLIDES) * 100);
  progressFill.style.width = pct + '%';
  progressText.textContent = pct + '% complete';
  slideCounter.textContent = `Slide ${currentSlide + 1} of ${TOTAL_SLIDES}`;
  prevBtn.disabled = currentSlide === 0;
  nextBtn.textContent = currentSlide === TOTAL_SLIDES - 1 ? 'Finish' : 'Next →';
  nextBtn.disabled = false;
}

prevBtn.addEventListener('click', () => { if (currentSlide > 0) goToSlide(currentSlide - 1); });
nextBtn.addEventListener('click', () => {
  if (currentSlide < TOTAL_SLIDES - 1) goToSlide(currentSlide + 1);
});

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('.tabs');
    group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    group.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    group.querySelector(`#${btn.dataset.tab}`).classList.add('active');
  });
});

// Quiz
const quizData = [
  {
    q: "Which ADDIE phase involves identifying performance gaps, target audience characteristics, and instructional goals?",
    options: ["Design", "Analyse", "Develop", "Implement"],
    correct: 1,
    feedback: {
      correct: "Correct! The Analysis phase is where you investigate the performance problem, understand your learners, and define what the training needs to achieve.",
      incorrect: "Not quite. The Analysis phase is where you investigate the performance gap, understand your learners, and identify what training needs to accomplish."
    }
  },
  {
    q: "A learning objective written using Bloom's Taxonomy should include which key element?",
    options: ["A clear, measurable action verb", "A general topic description", "The trainer's name and credentials", "The LMS platform being used"],
    correct: 0,
    feedback: {
      correct: "Exactly right! Bloom's Taxonomy requires a measurable action verb (like 'identify', 'demonstrate', or 'evaluate') so the objective can be assessed.",
      incorrect: "The most important element is a measurable action verb from Bloom's Taxonomy (e.g. 'identify', 'analyse', 'create') — this makes the objective assessable."
    }
  },
  {
    q: "In the ADDIE model, when should formative evaluation occur?",
    options: [
      "Only after the course is launched",
      "Before analysis begins",
      "Throughout all phases, not just at the end",
      "Only during the Implementation phase"
    ],
    correct: 2,
    feedback: {
      correct: "Correct! Formative evaluation is ongoing throughout every ADDIE phase — you review and refine at each step, not just at the end.",
      incorrect: "Formative evaluation is ongoing throughout every phase — it's how you catch problems early and refine the design before final delivery."
    }
  }
];

function renderQuiz() {
  const container = document.getElementById('quizContainer');
  if (!container) return;
  container.innerHTML = '';
  quizData.forEach((item, qi) => {
    const div = document.createElement('div');
    div.className = 'quiz-question';
    div.innerHTML = `
      <h3>Question ${qi + 1}: ${item.q}</h3>
      <div class="quiz-options">
        ${item.options.map((opt, oi) => `
          <div class="quiz-option" data-q="${qi}" data-o="${oi}" role="button" tabindex="0">
            <span class="option-letter">${String.fromCharCode(65 + oi)}</span>
            <span>${opt}</span>
          </div>
        `).join('')}
      </div>
      <div class="feedback-msg" id="feedback-${qi}"></div>
      <button class="quiz-submit-btn" data-q="${qi}" id="submit-${qi}" disabled>Check Answer</button>
    `;
    container.appendChild(div);
  });

  // Option click
  container.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      if (quizAnswered[opt.dataset.q]) return;
      const qi = opt.dataset.q;
      container.querySelectorAll(`.quiz-option[data-q="${qi}"]`).forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      document.getElementById(`submit-${qi}`).disabled = false;
    });
  });

  // Submit click
  container.querySelectorAll('.quiz-submit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qi = parseInt(btn.dataset.q);
      if (quizAnswered[qi]) return;
      const selected = container.querySelector(`.quiz-option[data-q="${qi}"].selected`);
      if (!selected) return;
      const oi = parseInt(selected.dataset.o);
      const isCorrect = oi === quizData[qi].correct;
      quizAnswered[qi] = isCorrect;

      container.querySelectorAll(`.quiz-option[data-q="${qi}"]`).forEach(o => {
        if (parseInt(o.dataset.o) === quizData[qi].correct) o.classList.add('correct');
      });
      if (!isCorrect) selected.classList.add('incorrect');

      const fb = document.getElementById(`feedback-${qi}`);
      fb.textContent = isCorrect ? quizData[qi].feedback.correct : quizData[qi].feedback.incorrect;
      fb.className = `feedback-msg show ${isCorrect ? 'correct' : 'incorrect'}`;
      btn.disabled = true;

      if (Object.keys(quizAnswered).length === quizData.length) showScore();
    });
  });
}

function showScore() {
  const score = Object.values(quizAnswered).filter(Boolean).length;
  const panel = document.getElementById('scorePanel');
  document.getElementById('scoreNum').textContent = score;
  let msg = score === 3 ? "Outstanding! You nailed all three questions." :
            score === 2 ? "Great work! Review the question you missed before moving on." :
            "Keep going! Re-read the slides and try again when ready.";
  document.getElementById('scoreMsg').textContent = msg;
  panel.classList.add('show');
}

// Init
renderQuiz();
updateUI();
