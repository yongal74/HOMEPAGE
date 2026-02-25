/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   app.js — 장우경 홈페이지 인터랙션
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ── 파티클 ── */
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = 55;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 2.5 + 0.5;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dur = Math.random() * 12 + 8;
    const del = Math.random() * -12;
    const col = Math.random() > 0.5 ? 'rgba(124,58,237,0.45)' : 'rgba(6,182,212,0.35)';
    Object.assign(p.style, {
      position: 'absolute',
      width: size + 'px', height: size + 'px',
      borderRadius: '50%',
      left: x + '%', top: y + '%',
      background: col,
      boxShadow: `0 0 ${size * 3}px ${col}`,
      animation: `floatParticle ${dur}s ${del}s ease-in-out infinite`,
      willChange: 'transform, opacity',
    });
    container.appendChild(p);
  }
  if (!document.getElementById('particle-keyframes')) {
    const style = document.createElement('style');
    style.id = 'particle-keyframes';
    style.textContent = `
      @keyframes floatParticle {
        0%,100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
        25% { transform: translateY(-28px) translateX(14px); opacity: 0.9; }
        50% { transform: translateY(-14px) translateX(-10px); opacity: 0.5; }
        75% { transform: translateY(-36px) translateX(6px); opacity: 0.8; }
      }`;
    document.head.appendChild(style);
  }
})();

/* ── 네비 스크롤 ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── 모바일 메뉴 ── */
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
menuToggle?.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  menuToggle.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
});
mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  menuToggle.textContent = '☰';
}));

/* ── Reveal on Scroll ── */
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); }
  }),
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.08 + 's';
  revealObserver.observe(el);
});

/* ── 활성 링크 ── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
const activeObserver = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active-link'));
        const link = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (link) link.classList.add('active-link');
      }
    });
  },
  { threshold: 0.4 }
);
sections.forEach(s => activeObserver.observe(s));

/* ── 블로그 카테고리 필터 ── */
const tabs = document.querySelectorAll('.tab');
const cards = document.querySelectorAll('.blog-card');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const cat = tab.dataset.cat;
    cards.forEach(card => {
      const show = cat === 'all' || card.dataset.cat === cat;
      card.style.display = show ? 'flex' : 'none';
      card.style.flexDirection = show ? 'column' : '';
      if (show) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 30);
      }
    });
  });
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   자동화 프로세스 다이어그램 생성기
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// 자동화 가능 키워드 패턴
const AUTO_PATTERNS = [
  { kw: ['수신', '받', '이메일', '메일', '알림'], icon: '📨', label: '자동 수신', hint: '이메일/슬랙 트리거 → N8N Webhook' },
  { kw: ['입력', '기록', '저장', '등록', '작성'], icon: '💾', label: '자동 저장', hint: 'DB/스프레드시트 자동 기록 → Google Sheets API' },
  { kw: ['변환', 'PDF', '엑셀', '문서', '파일'], icon: '🔄', label: '파일 자동 변환', hint: 'N8N HTTP Request → 파일 변환 API' },
  { kw: ['발송', '전송', '공유', '배포', '업로드'], icon: '📤', label: '자동 발송', hint: 'N8N Email/Slack 노드 → 자동 발송' },
  { kw: ['조회', '확인', '검색', '모니터링', '체크'], icon: '🔍', label: '자동 조회', hint: 'N8N Cron + HTTP → 자동 모니터링' },
  { kw: ['분류', '정렬', '필터', '분석', '통계'], icon: '📊', label: 'AI 분류/분석', hint: 'GPT-4o API → 자동 분류·요약' },
  { kw: ['승인', '결재', '확인', '검토'], icon: '✅', label: '승인 자동화', hint: 'N8N + Slack 버튼 → 원클릭 승인' },
  { kw: ['알람', '리마인더', '스케줄', '일정'], icon: '⏰', label: '스케줄 자동화', hint: 'N8N Cron 트리거 → 자동 알림' },
  { kw: ['복사', '이동', '클론', '동기화'], icon: '🔁', label: '데이터 동기화', hint: 'N8N → DB/API 양방향 동기화' },
  { kw: ['보고', '보고서', '리포트', '정리'], icon: '📋', label: '자동 보고서', hint: 'N8N + GPT → 자동 리포트 생성' },
];

function analyzeStep(text) {
  const lower = text.toLowerCase();
  for (const p of AUTO_PATTERNS) {
    if (p.kw.some(k => lower.includes(k))) {
      return { ...p, canAuto: true };
    }
  }
  return { icon: '👤', label: '수동 처리', hint: '단순화·표준화 후 자동화 검토', canAuto: false };
}

function generateDiagram(title, rawSteps) {
  const steps = rawSteps
    .split('\n')
    .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(s => s.length > 2);

  if (steps.length === 0) return '<p style="color:var(--text-3);font-size:.9rem;">단계를 입력해주세요.</p>';

  const autoCount = steps.filter(s => analyzeStep(s).canAuto).length;
  const ratio = Math.round((autoCount / steps.length) * 100);

  let html = `<div class="diagram">`;
  html += `<p style="font-size:.8rem;font-weight:800;color:var(--text-3);margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">⚡ ${title || '업무 자동화 흐름도'}</p>`;

  steps.forEach((step, i) => {
    const info = analyzeStep(step);
    const cls = info.canAuto ? 'auto' : 'manual';
    const lblCls = info.canAuto ? 'auto-label' : 'manual-label';
    html += `
      <div class="d-node ${cls}">
        <div class="d-icon">${info.icon}</div>
        <div class="d-content">
          <div class="d-label ${lblCls}">${info.label} ${info.canAuto ? '🤖' : '👤'}</div>
          <div class="d-text">${step}</div>
          <div style="font-size:.72rem;color:var(--text-3);margin-top:4px;">${info.hint}</div>
        </div>
      </div>`;
    if (i < steps.length - 1) html += `<div class="d-arrow">↓</div>`;
  });

  html += `<div class="d-summary">
    ✅ 자동화 가능 단계: <strong style="color:var(--cyan-light)">${autoCount}/${steps.length}건 (${ratio}%)</strong><br/>
    💡 ${ratio >= 70 ? '높은 자동화율! N8N 워크플로우로 즉시 구현 가능합니다.' : ratio >= 40 ? '중간 수준의 자동화가 가능합니다. 프로젝트 의뢰를 권장합니다.' : '전략 컨설팅을 통한 프로세스 재설계를 권장합니다.'}<br/>
    🚀 예상 절감 시간: <strong style="color:var(--purple-light)">월 ${Math.round(steps.length * autoCount * 2.5)}시간</strong>
  </div>`;
  html += '</div>';
  return html;
}

const generateBtn = document.getElementById('generate-btn');
const diagramArea = document.getElementById('diagram-area');
const processInput = document.getElementById('process-input');
const processTitle = document.getElementById('process-title');

generateBtn?.addEventListener('click', () => {
  const steps = processInput?.value.trim() || '';
  const title = processTitle?.value.trim() || '';
  if (!steps) {
    diagramArea.innerHTML = '<p style="color:#f87171;text-align:center;padding:24px">업무 단계를 입력해주세요.</p>';
    return;
  }
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span>분석 중...</span><span class="btn-icon">⏳</span>';
  setTimeout(() => {
    diagramArea.innerHTML = generateDiagram(title, steps);
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span>자동화 흐름도 생성</span><span class="btn-icon">→</span>';
  }, 800);
});

/* ── 연락처 폼 ── */
const contactForm = document.getElementById('contact-form');
contactForm?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = '전송 중...';
  setTimeout(() => {
    contactForm.innerHTML = `
      <div id="form-success" style="display:block">
        <div style="font-size:3rem;margin-bottom:16px">✅</div>
        <p style="font-size:1.2rem;font-weight:800;color:#6ee7b7;margin-bottom:8px">문의가 접수되었습니다!</p>
        <p style="font-size:.9rem;color:var(--text-2)">24시간 이내에 회신드리겠습니다.</p>
      </div>`;
  }, 1200);
});

/* ── 스무스 앵커 ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
