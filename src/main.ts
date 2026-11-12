import './index.css';
import { audio } from './utils/audio';
import {
  HeartCollector,
  INITIAL_HEART_MESSAGES,
  getNextSurprise,
  buildWhatsAppProposalUrl,
  SecretEasterEggCounter
} from './utils/logic';

// --- State Instances ---
const heartCollector = new HeartCollector();
const easterEggTracker = new SecretEasterEggCounter();
let lastSurpriseIndex = -1;
let selectedDateIdea = '☕ Cute Coffee Date';
let isLetterOpened = false;

// --- Helper: Spawn Heart Burst Particle ---
function spawnHeartParticle(x: number, y: number, color = '#E63946') {
  const heart = document.createElement('div');
  heart.className = 'particle-heart';
  heart.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${color}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
  
  const tx = (Math.random() - 0.5) * 120 + 'px';
  const ty = -Math.random() * 80 - 40 + 'px';
  const tr = (Math.random() - 0.5) * 90 + 'deg';

  heart.style.left = `${x - 10}px`;
  heart.style.top = `${y - 10}px`;
  heart.style.setProperty('--tx', tx);
  heart.style.setProperty('--ty', ty);
  heart.style.setProperty('--tr', tr);

  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 1000);
}

// Global click sparkler
document.addEventListener('click', (e: MouseEvent) => {
  // Avoid interfering if target is inside form inputs
  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
  spawnHeartParticle(e.clientX, e.clientY);
});

// --- Ambient Background Floating Hearts Canvas ---
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  interface Particle {
    x: number;
    y: number;
    size: number;
    speedY: number;
    speedX: number;
    opacity: number;
    scale: number;
  }

  const particles: Particle[] = [];
  const maxParticles = window.innerWidth < 640 ? 14 : 26;

  for (let i = 0; i < maxParticles; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 12 + 8,
      speedY: Math.random() * 0.4 + 0.2,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.15,
      scale: Math.random() * 0.5 + 0.8
    });
  }

  function drawHeart(x: number, y: number, size: number, opacity: number) {
    if (!ctx) return;
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.scale(size / 30, size / 30);
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-15, -15, -30, 5, 0, 30);
    ctx.bezierCurveTo(30, 5, 15, -15, 0, 0);
    ctx.fillStyle = `rgba(230, 57, 70, ${opacity})`;
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.y -= p.speedY;
      p.x += p.speedX;

      if (p.y < -30) {
        p.y = height + 30;
        p.x = Math.random() * width;
      }
      if (p.x < -30) p.x = width + 30;
      if (p.x > width + 30) p.x = -30;

      drawHeart(p.x, p.y, p.size, p.opacity);
    }
    requestAnimationFrame(animate);
  }

  animate();
}

// --- Confetti Cannon (Zero external dependencies) ---
function triggerCelebrationConfetti() {
  const count = 90;
  const colors = ['#E63946', '#C1121F', '#FFD166', '#FFB703', '#FFE5E9', '#FFFFFF'];

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'fixed pointer-events-none z-50 rounded-sm';
    const isHeart = Math.random() > 0.4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 12 + 6;

    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = color;
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = '-20px';
    confetti.style.opacity = '1';

    if (isHeart) {
      confetti.style.borderRadius = '50%';
    }

    document.body.appendChild(confetti);

    const fallDuration = Math.random() * 2500 + 2000;
    const drift = (Math.random() - 0.5) * 300;
    const rotation = Math.random() * 720;

    confetti.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        {
          transform: `translate(${drift}px, ${window.innerHeight + 50}px) rotate(${rotation}deg)`,
          opacity: 0.2
        }
      ],
      {
        duration: fallDuration,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
      }
    ).onfinish = () => confetti.remove();
  }
}

// --- Falling Rose Petals in Proposal Section ---
function initRosePetals() {
  const container = document.getElementById('rose-petals-container');
  if (!container) return;

  function createPetal() {
    if (!container) return;
    const petal = document.createElement('div');
    petal.className = 'absolute pointer-events-none select-none';
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.top = '-30px';
    petal.style.animation = `petalFall ${Math.random() * 4 + 4}s linear forwards`;
    petal.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#E63946" opacity="${Math.random() * 0.4 + 0.3}">
        <path d="M12 2C8 2 4 6 4 11C4 16 9 20 12 22C15 20 20 16 20 11C20 6 16 2 12 2Z" />
      </svg>
    `;
    container.appendChild(petal);
    setTimeout(() => petal.remove(), 8000);
  }

  setInterval(createPetal, 1200);
}

// --- Typewriter Effect ---
function runTypewriter(
  element: HTMLElement,
  text: string,
  speed: number = 30,
  onComplete?: () => void
) {
  element.textContent = '';
  let i = 0;
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else if (onComplete) {
      onComplete();
    }
  }
  type();
}

// --- Setup Hearts Mini-game ---
function initHeartsSection() {
  const grid = document.getElementById('heart-grid');
  const counterText = document.getElementById('heart-counter-text');
  const progressBar = document.getElementById('heart-progress-bar');
  const banner = document.getElementById('heart-all-collected-banner');
  if (!grid || !counterText || !progressBar) return;

  grid.innerHTML = '';

  INITIAL_HEART_MESSAGES.forEach((msg, idx) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className =
      'heart-item-btn p-4 rounded-2xl bg-white border-2 border-[#FFE5E9] hover:border-[#E63946] shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all text-center flex flex-col items-center justify-center min-h-[9rem] relative group';
    card.setAttribute('aria-label', `Heart number ${idx + 1}`);

    card.innerHTML = `
      <div class="heart-icon-wrapper text-[#E63946] mb-2 transform group-hover:scale-125 transition-transform">
        <svg class="w-8 h-8 fill-current" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <span class="heart-number text-xs font-semibold text-[#827575] group-hover:text-[#C1121F]">Heart #${idx + 1}</span>
      <p class="heart-text hidden mt-2 text-xs sm:text-sm font-medium text-[#292323] leading-snug font-['Caveat'] text-lg">"${msg}"</p>
    `;

    card.addEventListener('click', (e) => {
      audio.playHeartCollect();
      const rect = card.getBoundingClientRect();
      spawnHeartParticle(rect.left + rect.width / 2, rect.top + rect.height / 2);

      const res = heartCollector.collect(idx);

      // Card visual update
      card.classList.add('border-[#E63946]', 'bg-[#FFF0F2]/50');
      const numberSpan = card.querySelector('.heart-number');
      const textP = card.querySelector('.heart-text');
      if (numberSpan) numberSpan.classList.add('hidden');
      if (textP) textP.classList.remove('hidden');

      // Update progress
      counterText.textContent = `Little hearts collected: ${res.totalCollected}/10`;
      progressBar.style.width = `${(res.totalCollected / 10) * 100}%`;

      if (res.isComplete && banner) {
        banner.classList.remove('hidden');
        setTimeout(() => {
          banner.classList.remove('scale-95', 'opacity-0');
          banner.classList.add('scale-100', 'opacity-100');
        }, 50);
        triggerCelebrationConfetti();
        audio.playCelebrationFanfare();
      }
    });

    grid.appendChild(card);
  });
}

// --- Setup Interactive Envelope & Love Letter ---
function initLoveLetterSection() {
  const envelope = document.getElementById('envelope-pocket');
  const flap = document.getElementById('envelope-flap');
  const sheet = document.getElementById('letter-sheet');
  const content = document.getElementById('letter-content');
  const signature = document.getElementById('letter-signature');
  const controls = document.getElementById('after-letter-controls');

  if (!envelope || !flap || !sheet || !content || !signature || !controls) return;

  const contentEl = content;
  const signatureEl = signature;
  const controlsEl = controls;

  envelope.addEventListener('click', () => {
    if (isLetterOpened) return;
    isLetterOpened = true;

    audio.playEnvelopeOpen();
    flap.classList.add('open');
    sheet.classList.add('extracted');

    const lines = [
      "I wanted to do something a little different for you.",
      "Not because I needed a reason, but because sometimes a little effort can make someone's day brighter.",
      "I hope this little website has made you smile, even if just a little.",
      "You deserve happiness, beautiful memories, lots of laughter, and all the good things life has to offer.",
      "And there's something I've been meaning to ask you..."
    ];

    contentEl.innerHTML = '';
    let lineIdx = 0;

    function typeNextLine() {
      if (lineIdx < lines.length) {
        const p = document.createElement('p');
        contentEl.appendChild(p);
        runTypewriter(p, lines[lineIdx], 22, () => {
          lineIdx++;
          setTimeout(typeNextLine, 250);
        });
      } else {
        signatureEl.classList.remove('hidden');
        controlsEl.classList.remove('opacity-0');
      }
    }

    setTimeout(typeNextLine, 600);
  });
}

// --- Main DOM Ready Initializer ---
document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initRosePetals();
  initHeartsSection();
  initLoveLetterSection();

  // Navigation Links & Smooth Scrolling
  const mobileMenuBtn = document.getElementById('btn-mobile-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      audio.playPop();
      mobileMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Audio SFX Toggle Button
  const btnToggleSfx = document.getElementById('btn-toggle-sfx');
  const iconSfxOn = document.getElementById('icon-sfx-on');
  const iconSfxOff = document.getElementById('icon-sfx-off');
  if (btnToggleSfx && iconSfxOn && iconSfxOff) {
    btnToggleSfx.addEventListener('click', () => {
      const newState = !audio.isSfxEnabled();
      audio.setSfxEnabled(newState);
      if (newState) {
        iconSfxOn.classList.remove('hidden');
        iconSfxOff.classList.add('hidden');
        audio.playPop();
      } else {
        iconSfxOn.classList.add('hidden');
        iconSfxOff.classList.remove('hidden');
      }
    });
  }

  // Romantic Music Box Toggle Button
  const btnToggleMusic = document.getElementById('btn-toggle-music');
  const musicIndicator = document.getElementById('music-indicator');
  if (btnToggleMusic && musicIndicator) {
    btnToggleMusic.addEventListener('click', () => {
      const isPlaying = audio.toggleMusic();
      if (isPlaying) {
        musicIndicator.classList.remove('hidden');
        btnToggleMusic.classList.add('text-[#E63946]', 'bg-[#FFE5E9]');
      } else {
        musicIndicator.classList.add('hidden');
        btnToggleMusic.classList.remove('text-[#E63946]', 'bg-[#FFE5E9]');
      }
    });
  }

  // Hero Buttons
  const btnOpenSurprise = document.getElementById('btn-open-surprise');
  const btnCurious = document.getElementById('btn-curious');
  const specialMessageSection = document.getElementById('special-message');

  const scrollToSpecial = () => {
    audio.playPop();
    specialMessageSection?.scrollIntoView({ behavior: 'smooth' });
  };
  btnOpenSurprise?.addEventListener('click', scrollToSpecial);
  btnCurious?.addEventListener('click', scrollToSpecial);

  // Special Message Section: "Tell Me More!"
  const btnTellMore = document.getElementById('btn-tell-more');
  const typewriterContainer = document.getElementById('typewriter-container');
  const typewriterText = document.getElementById('typewriter-text');
  const typewriterSig = document.getElementById('typewriter-signature');

  if (btnTellMore && typewriterContainer && typewriterText && typewriterSig) {
    btnTellMore.addEventListener('click', () => {
      audio.playPop();
      btnTellMore.classList.add('opacity-50', 'pointer-events-none');
      typewriterContainer.classList.remove('hidden');

      const extraSweetMessage =
        "You bring such a bright, effortless warmth into the room, and whenever you smile, it's genuinely infectious. I really wanted to take a moment to celebrate you and remind you how wonderful you are!";

      runTypewriter(typewriterText, extraSweetMessage, 25, () => {
        typewriterSig.classList.remove('hidden');
      });
    });
  }

  // Fun Surprise Generator Button
  const btnRandomSurprise = document.getElementById('btn-random-surprise');
  const surpriseCard = document.getElementById('surprise-card');
  const surpriseText = document.getElementById('surprise-text');

  if (btnRandomSurprise && surpriseCard && surpriseText) {
    btnRandomSurprise.addEventListener('click', () => {
      audio.playSurpriseWiggle();
      const surprise = getNextSurprise(lastSurpriseIndex);
      lastSurpriseIndex = surprise.index;

      surpriseCard.classList.add('scale-95', 'bg-[#FFE5E9]');
      setTimeout(() => {
        surpriseText.textContent = surprise.message;
        surpriseCard.classList.remove('scale-95', 'bg-[#FFE5E9]');
        surpriseCard.classList.add('scale-100');
      }, 150);
    });
  }

  // Proposal Section: MAYBE Button
  const btnProposalMaybe = document.getElementById('btn-proposal-maybe');
  const btnAskAgain = document.getElementById('btn-ask-again');
  const proposalButtonsRow = document.getElementById('proposal-buttons-row');
  const maybeResponseCard = document.getElementById('maybe-response-card');

  if (btnProposalMaybe && btnAskAgain && proposalButtonsRow && maybeResponseCard) {
    btnProposalMaybe.addEventListener('click', () => {
      audio.playPop();
      proposalButtonsRow.classList.add('hidden');
      maybeResponseCard.classList.remove('hidden');
    });

    btnAskAgain.addEventListener('click', () => {
      audio.playPop();
      maybeResponseCard.classList.add('hidden');
      proposalButtonsRow.classList.remove('hidden');
    });
  }

  // Proposal Section: YES Button
  const btnProposalYes = document.getElementById('btn-proposal-yes');
  const proposalMainCard = document.getElementById('proposal-main-card');
  const yesCelebrationContainer = document.getElementById('yes-celebration-container');

  if (btnProposalYes && proposalMainCard && yesCelebrationContainer) {
    btnProposalYes.addEventListener('click', () => {
      audio.playCelebrationFanfare();
      triggerCelebrationConfetti();

      proposalMainCard.classList.add('hidden');
      yesCelebrationContainer.classList.remove('hidden');

      yesCelebrationContainer.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Date Planner Ideas Selection
  const dateOptionButtons = document.querySelectorAll<HTMLButtonElement>('.date-option-btn');
  dateOptionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      audio.playPop();
      dateOptionButtons.forEach((b) => {
        b.classList.remove('border-[#E63946]', 'bg-[#FFF0F2]', 'text-[#C1121F]');
        b.classList.add('border-[#FFE5E9]', 'bg-white', 'text-[#292323]');
        const check = b.querySelector('.checkmark');
        if (check) check.classList.add('hidden');
      });

      btn.classList.remove('border-[#FFE5E9]', 'bg-white', 'text-[#292323]');
      btn.classList.add('border-[#E63946]', 'bg-[#FFF0F2]', 'text-[#C1121F]');
      const check = btn.querySelector('.checkmark');
      if (check) check.classList.remove('hidden');

      selectedDateIdea = btn.getAttribute('data-idea') || 'A Surprise Plan';
    });
  });

  // Proposal WhatsApp Submit Button
  const btnSubmitProposal = document.getElementById('btn-submit-proposal');
  const planDateInput = document.getElementById('plan-date') as HTMLInputElement | null;
  const planTimeInput = document.getElementById('plan-time') as HTMLInputElement | null;
  const planNoteInput = document.getElementById('plan-note') as HTMLTextAreaElement | null;
  const phoneInput = document.getElementById('input-phone-number') as HTMLInputElement | null;

  if (btnSubmitProposal) {
    btnSubmitProposal.addEventListener('click', () => {
      audio.playCelebrationFanfare();
      triggerCelebrationConfetti();

      const waUrl = buildWhatsAppProposalUrl({
        dateIdea: selectedDateIdea,
        preferredDate: planDateInput?.value || '',
        preferredTime: planTimeInput?.value || '',
        personalMessage: planNoteInput?.value || '',
        phoneNumber: phoneInput?.value || ''
      });

      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // Footer Secret Easter Egg (Click 7 times!)
  const easterEggHeart = document.getElementById('easter-egg-heart');
  const easterEggModal = document.getElementById('easter-egg-modal') as HTMLDialogElement | null;
  const btnCloseEasterEgg = document.getElementById('btn-close-easter-egg');

  if (easterEggHeart && easterEggModal) {
    easterEggHeart.addEventListener('click', () => {
      audio.playPop();
      const res = easterEggTracker.click();
      if (res.triggered) {
        audio.playCelebrationFanfare();
        triggerCelebrationConfetti();
        easterEggModal.showModal();
      }
    });

    btnCloseEasterEgg?.addEventListener('click', () => {
      easterEggModal.close();
    });
  }

  // Floating Back to Top Button
  const btnBackToTop = document.getElementById('btn-back-to-top');
  if (btnBackToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btnBackToTop.classList.remove('opacity-0', 'pointer-events-none');
        btnBackToTop.classList.add('opacity-100');
      } else {
        btnBackToTop.classList.add('opacity-0', 'pointer-events-none');
        btnBackToTop.classList.remove('opacity-100');
      }
    });

    btnBackToTop.addEventListener('click', () => {
      audio.playPop();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
