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
   CMS 콘텐츠 로더 (저서, 블로그, 리소스)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
async function loadCMSData() {
  try {
    const res = await fetch('data/content.json');
    if (!res.ok) throw new Error('CMS data not found');
    const data = await res.json();
    renderBlogs(data.blogs);
    // TODO: 서적과 리소스 영역도 향후 렌더링에 연결
  } catch (err) {
    console.error('Failed to load CMS data:', err);
  }
}

function renderBlogs(blogs) {
  const grid = document.getElementById('blog-grid');
  if (!grid || !blogs) return;

  // 기존 하드코딩된 내용 대신 JSON 데이터로만 채우기
  grid.innerHTML = '';

  blogs.forEach((blog, i) => {
    const card = document.createElement('article');
    card.className = `blog-card reveal visible`;
    card.style.transitionDelay = `${(i % 4) * 0.08}s`;
    card.dataset.cat = blog.category;

    card.innerHTML = `
      <div class="blog-cat ${blog.category.toLowerCase()}">${blog.categoryLabel}</div>
      <h3>${blog.title}</h3>
      <p>${blog.summary}</p>
      <div class="blog-footer">
        <span class="blog-date">${blog.date}</span>
        <a href="${blog.link}" class="blog-read">읽기 →</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

// 사이트 로드 시 CMS 데이터 호출
window.addEventListener('DOMContentLoaded', loadCMSData);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Antigravity 코파일럿 진단 (Dual-Track Algorithm)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// 트랙 A: 기존 기업 아키타입
const EXISTING_BIZ_PATTERNS = [
  { kw: ['영업', '세일즈', '리드', '연락처', '명함'], label: '리드 관리 자동화', desc: '퍼널별 잠재고객 자동 수집 및 후속 메일 발송 셋업', stack: ['Antigravity', 'n8n', 'Zapier (Fallback)'] },
  { kw: ['마케팅', '콘텐츠', 'SNS', '광고', '블로그'], label: '콘텐츠/마케팅 자동화', desc: 'AI 기반 트렌드 수집부터 SNS 자동 발행까지', stack: ['Antigravity', 'n8n', 'Remotion', 'NotebookLM'] },
  { kw: ['CS', '고객지원', '문의', '상담', '환불'], label: '고객지원(CS) 자동화', desc: 'FAQ 및 1차 문의 자동 분류·답변 에이전트 구축', stack: ['Antigravity', 'Claude Code', 'Intercom'] }
];

// 트랙 B: 1인 기업 아키타입
const SOLO_BIZ_PATTERNS = [
  { kw: ['기획', '전략', 'PM', '컨설팅'], label: '프리미엄 지식 컨설팅', path: 'B2B 진단 워크숍 + 자문 서비스', stack: ['Antigravity', 'Pencil (제안서)', 'Claude Code'] },
  { kw: ['개발', '데이터', 'IT', '분석'], label: '마이크로 SaaS / 툴킷', path: '비개발자용 노코드/자동화 템플릿 구독 모델', stack: ['Antigravity', 'n8n', 'v0', 'Claude Code'] },
  { kw: ['교육', '강의', '디자인', '글쓰기', '크리에이터'], label: '콘텐츠/커뮤니티 비즈니스', path: '자동화된 뉴스레터 및 코호트 강의', stack: ['Antigravity', 'beehiiv', 'Remotion', 'NotebookLM'] }
];

function analyzeCopilot(track, keywords) {
  const lowerKw = keywords.toLowerCase();
  const patterns = track === 'existing' ? EXISTING_BIZ_PATTERNS : SOLO_BIZ_PATTERNS;

  for (const p of patterns) {
    if (p.kw.some(k => lowerKw.includes(k))) {
      return { ...p, track };
    }
  }
  // Fallback (매칭 안 될 경우 가장 범용적인 세팅)
  if (track === 'existing') {
    return { label: '기본 업무 자동화', desc: '반복적인 서류/데이터 작업의 n8n 파이프라인 구축', stack: ['Antigravity', 'n8n'] };
  } else {
    return { label: '1인 지식 크리에이터', path: '개인 경험 기반 전자책/강의 판매 시스템', stack: ['Antigravity', 'Claude Code', 'Pencil'] };
  }
}

function renderCopilotResult(result) {
  let html = `<div class="copilot-result fade-in" style="background: rgba(20,20,30,0.8); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-top: 24px;">`;

  if (result.track === 'existing') {
    html += `<p style="color:var(--cyan-light); font-size: 0.85rem; font-weight:800; margin-bottom:8px;">[🚀 기존 기업 자동화 진단]</p>`;
    html += `<h3 style="margin-bottom: 12px; color:white;">${result.label}</h3>`;
    html += `<p style="color:var(--text-2); font-size:0.95rem; margin-bottom: 20px;">${result.desc}</p>`;
  } else {
    html += `<p style="color:var(--purple-light); font-size: 0.85rem; font-weight:800; margin-bottom:8px;">[🚀 1인 비즈니스 설계 진단]</p>`;
    html += `<h3 style="margin-bottom: 12px; color:white;">${result.label}</h3>`;
    html += `<p style="color:var(--text-2); font-size:0.95rem; margin-bottom: 20px;">추천 루트: <strong>${result.path}</strong></p>`;
  }

  // Antigravity Stack Visualization
  html += `
    <div style="background: rgba(0,0,0,0.4); border-radius: 12px; padding: 16px;">
      <p style="font-size: 0.8rem; color:var(--text-3); margin-bottom: 12px; font-weight: 600;">THE ANTIGRAVITY STACK</p>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        ${result.stack.map(s => {
    const isCore = s.includes('Antigravity');
    const bg = isCore ? 'linear-gradient(45deg, var(--cyan), var(--purple))' : 'rgba(255,255,255,0.1)';
    const color = isCore ? '#fff' : 'var(--text-1)';
    const fw = isCore ? '800' : '400';
    return `<span style="padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; background:${bg}; color:${color}; font-weight:${fw};">${s}</span>`;
  }).join('')}
      </div>
    </div>
  `;
  html += `</div>`;
  return html;
}

// 이벤트 핸들링: 진단 트랙 선택 및 결과 생성
document.addEventListener('DOMContentLoaded', () => {
  const btnGenerate = document.getElementById('generate-btn');
  const area = document.getElementById('diagram-area');
  const btnTrackExisting = document.getElementById('track-existing');
  const btnTrackSolo = document.getElementById('track-solo');
  const inputLabel = document.getElementById('input-label-dynamic');
  const inputArea = document.getElementById('process-input');

  let currentTrack = 'solo'; // Default

  // Track selection logic
  function selectTrack(track) {
    currentTrack = track;
    if (track === 'existing') {
      btnTrackExisting.classList.replace('btn-ghost', 'btn-primary');
      btnTrackSolo.classList.replace('btn-primary', 'btn-ghost');
      inputLabel.innerText = '2. 핵심 비즈니스 고민 (병목 구간, 수작업 루틴 등) *';
      inputArea.placeholder = '예: 매일 들어오는 고객 문의 답변과 영업 리드 관리가 너무 오래 걸립니다.';
    } else {
      btnTrackSolo.classList.replace('btn-ghost', 'btn-primary');
      btnTrackExisting.classList.replace('btn-primary', 'btn-ghost');
      inputLabel.innerText = '2. 나의 커리어 자산 (직무, 스킬, 이력, 관심사) *';
      inputArea.placeholder = '예: 7년차 BX 디자이너, 노코드 툴 관심 많음, 전자책 출판 경험 있음';
    }
  }

  // Bind click events
  if (btnTrackExisting) btnTrackExisting.addEventListener('click', () => selectTrack('existing'));
  if (btnTrackSolo) btnTrackSolo.addEventListener('click', () => selectTrack('solo'));

  // Initialize UI state
  selectTrack('solo');

  // Generate logic
  if (btnGenerate && area) {
    btnGenerate.addEventListener('click', () => {
      const val = inputArea?.value || '';
      if (!val.trim()) {
        area.innerHTML = '<p style="color:#f87171;text-align:center;padding:24px">핵심 키워드를 입력해주세요.</p>';
        return;
      }

      btnGenerate.disabled = true;
      btnGenerate.innerHTML = '<span>분석 중...</span><span class="btn-icon">⏳</span>';

      setTimeout(() => {
        const res = analyzeCopilot(currentTrack, val);
        area.innerHTML = renderCopilotResult(res);
        btnGenerate.disabled = false;
        btnGenerate.innerHTML = '<span>내 비즈니스 스택 확인하기</span><span class="btn-icon">→</span>';
      }, 1000);
    });
  }
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
    < div id = "form-success" style = "display:block" >
        <div style="font-size:3rem;margin-bottom:16px">✅</div>
        <p style="font-size:1.2rem;font-weight:800;color:#6ee7b7;margin-bottom:8px">문의가 접수되었습니다!</p>
        <p style="font-size:.9rem;color:var(--text-2)">24시간 이내에 회신드리겠습니다.</p>
      </div > `;
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
