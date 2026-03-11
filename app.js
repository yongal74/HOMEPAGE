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
    const res = await fetch(`data/content.json?t=${new Date().getTime()}`);
    if (!res.ok) throw new Error('CMS data not found');
    const data = await res.json();
    renderBooks(data.books);
    renderResources(data.resources);
    renderBlogs(data.blogs);
  } catch (err) {
    console.error('Failed to load CMS data:', err);
  }
}

function renderBooks(books) {
  const grid = document.getElementById('books-grid');
  if (!grid || !books) return;
  grid.innerHTML = '';

  books.forEach((book, i) => {
    const card = document.createElement('div');
    card.className = `book-card reveal visible`;
    card.style.transitionDelay = `${(i % 3) * 0.1}s`;

    // 테마 컬러에 따른 동적 태그 스타일링
    let tagStyle = '';
    if (book.themeColor === 'cyan') {
      tagStyle = 'background: rgba(6,182,212,.15); color: var(--cyan-light); border-color: rgba(6,182,212,.3);';
    } else if (book.themeColor === 'teal') {
      tagStyle = 'background: rgba(16,185,129,.15); color: #6ee7b7; border-color: rgba(16,185,129,.3);';
    }

    card.innerHTML = `
      <div class="book-cover-img">
        <img src="${book.coverImg}" alt="${book.title} 표지" loading="lazy" />
        <div class="book-img-shine"></div>
      </div>
      <div class="book-info">
        <span class="book-series-tag" style="${tagStyle}">${book.series}</span>
        <h3>${book.title}</h3>
        <p>${book.description}</p>
        <ul class="book-tags">
          ${book.tags.map(t => `<li>${t}</li>`).join('')}
        </ul>
        <div class="book-actions">
          <a href="${book.link}" target="_blank" class="btn-book ${book.themeColor === 'teal' ? 'btn-book-teal' : ''}">교보문고 바로가기</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderResources(resources) {
  const grid = document.getElementById('resources-grid');
  if (!grid || !resources) return;
  grid.innerHTML = '';

  resources.forEach((res, i) => {
    const card = document.createElement('article');
    card.className = `blog-card reveal visible`; // Use blog-card styles as a base
    card.style.transitionDelay = `${(i % 3) * 0.1}s`;

    card.innerHTML = `
      <div class="res-icon">${res.icon}</div>
      <div class="blog-cat auto">${res.type}</div>
      <h3 style="margin-top: 12px;">${res.title}</h3>
      <p>${res.description}</p>
      <div class="blog-footer" style="margin-top:auto;">
        <span class="blog-date">무료 배포</span>
        <a href="${res.link}" class="blog-read">다운로드 →</a>
      </div>
    `;
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    grid.appendChild(card);
  });
}

function renderBlogs(blogs) {
  const grid = document.getElementById('blog-grid');
  const tabsContainer = document.getElementById('category-tabs');
  if (!grid || !blogs || !tabsContainer) return;

  // 1. 모든 블로그 데이터에서 태그(categoryLabel) 추출 및 중복 제거
  const allTags = new Set();
  blogs.forEach(blog => {
    if (blog.categoryLabel) {
      // "테크|AI|혁신" 같은 문자열을 분리해서 태그로 사용
      const tags = blog.categoryLabel.split('|').map(t => t.trim()).filter(t => t);
      tags.forEach(t => allTags.add(t));
      // 내부 데이터로 배열 저장 (필터링 용도)
      blog._tags = tags;
    } else {
      blog._tags = [];
    }
  });

  const uniqueTags = Array.from(allTags).sort();

  // 2. 동적 카테고리 탭 생성
  tabsContainer.innerHTML = '';

  // '전체' 탭
  const btnAll = document.createElement('button');
  btnAll.className = 'tab active';
  btnAll.dataset.cat = 'all';
  btnAll.textContent = '전체';
  tabsContainer.appendChild(btnAll);

  // 개별 태그 탭
  uniqueTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.cat = tag;
    btn.textContent = tag;
    tabsContainer.appendChild(btn);
  });

  // 3. 날짜 역순 정렬 및 최신 날짜 파악 (하루치만 보여주기 위함)
  blogs.sort((a, b) => b.date.localeCompare(a.date));
  const latestDate = blogs.length > 0 ? blogs[0].date : null;

  let currentSelectedTag = 'all';
  let isArchiveVisible = false;
  const btnArchive = document.getElementById('btn-show-archive');

  if (btnArchive) {
    // 이전 리스너 방지를 위해 재생성 (복제)
    const newBtn = btnArchive.cloneNode(true);
    btnArchive.parentNode.replaceChild(newBtn, btnArchive);
    newBtn.addEventListener('click', () => {
      isArchiveVisible = true;
      filterBlogs(currentSelectedTag);
    });
  }

  // 4. 필터링 로직 구현 헬퍼
  const filterBlogs = (selectedTag) => {
    currentSelectedTag = selectedTag;
    grid.innerHTML = ''; // 그리드 초기화

    // 선택된 태그에 맞는 블로그 필터링 ('all' 이면 전부 표시)
    let filteredBlogs = selectedTag === 'all'
      ? blogs
      : blogs.filter(b => b._tags.includes(selectedTag));

    // 아카이빙 로직: Archive가 비활성화 상태이고 최신 날짜가 존재하면,
    // [최신 날짜]인 게시글만 노출. 단, 조회결과가 0개면 무조건 전체 노출.
    let visibleBlogs = filteredBlogs;
    if (!isArchiveVisible && latestDate) {
      const todayBlogs = filteredBlogs.filter(b => b.date === latestDate);
      if (todayBlogs.length > 0) {
        visibleBlogs = todayBlogs;
      }
    }

    // 아카이브 버튼 토글
    const currentBtnArchive = document.getElementById('btn-show-archive');
    if (currentBtnArchive) {
      if (!isArchiveVisible && filteredBlogs.length > visibleBlogs.length) {
        currentBtnArchive.style.display = 'inline-block';
      } else {
        currentBtnArchive.style.display = 'none';
      }
    }

    visibleBlogs.forEach((blog, i) => {
      const card = document.createElement('article');
      card.className = `blog-card reveal visible`;
      card.style.transitionDelay = `${(i % 4) * 0.08}s`;
      card.dataset.cat = selectedTag === 'all' ? blog.category : selectedTag;

      const tagsHtml = blog._tags.length > 0
        ? `<div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;">` +
        blog._tags.map(t => `<span class="blog-cat" style="background:rgba(255,255,255,0.05); color:var(--text-2); font-size:0.75rem; padding:4px 8px;">#${t}</span>`).join('') +
        `</div>`
        : `<div class="blog-cat ${blog.category?.toLowerCase() || ''}">${blog.categoryLabel || blog.category || 'NEWS'}</div>`;

      card.innerHTML = `
        ${tagsHtml}
        <h3>${blog.title}</h3>
        <p>${blog.summary}</p>
        <div class="blog-footer">
          <span class="blog-date">${blog.date}</span>
          <a href="${blog.link}" class="blog-read" target="_blank">읽기 →</a>
        </div>
      `;
      grid.appendChild(card);
    });
  };

  // 5. 초기 렌더링 (전체 + 최신 날짜만)
  filterBlogs('all');

  // 6. 탭 클릭 이벤트 리스너 등록
  tabsContainer.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      // 엑티브 클래스 변경
      tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');

      // 필터링 실행
      filterBlogs(e.target.dataset.cat);
    });
  });
}

// 사이트 로드 시 CMS 데이터 호출
window.addEventListener('DOMContentLoaded', loadCMSData);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Antigravity 코파일럿 진단 (Dynamic JSON-based Algorithm)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

let copilotData = null;

// 상태 관리
let currentState = {
  track: null,
  industry: null,
  category: null,
  task: null,
  painPoint: null
};

// DOM 요소 모음
const ui = {
  steps: {
    track: document.getElementById('step-track'),
    industry: document.getElementById('step-industry'),
    painpoint: document.getElementById('step-painpoint'),
    solo: document.getElementById('step-solo-input')
  },
  selects: {
    industry: document.getElementById('select-industry'),
    category: document.getElementById('select-category'),
    task: document.getElementById('select-task')
  },
  buttons: {
    trackBtns: document.querySelectorAll('#step-track .btn-ghost'),
    nextToTask: document.getElementById('btn-next-to-task'),
    backToIndustry: document.getElementById('btn-back-to-industry'),
    generateExisting: document.getElementById('btn-generate-existing'),
    backToTrackSolo: document.getElementById('btn-back-to-track'),
    generateSolo: document.getElementById('btn-generate-solo')
  },
  radios: document.getElementById('painpoint-radio-group'),
  area: document.getElementById('diagram-area'),
  placeholder: document.getElementById('diagram-placeholder-initial')
};

// JSON 데이터 페칭
async function loadCopilotData() {
  try {
    const res = await fetch(`data/copilot_data.json?t=${new Date().getTime()}`);
    if (!res.ok) throw new Error('Copilot data not found');
    copilotData = await res.json();
    initExistingBusinessFlow();
  } catch (err) {
    console.error('Failed to load copilot data:', err);
  }
}

// ── 유틸: 스텝 전환 ──
function showStep(stepName) {
  Object.values(ui.steps).forEach(el => {
    if (el) el.classList.remove('active');
  });
  if (ui.steps[stepName]) ui.steps[stepName].classList.add('active');

  if (ui.area) ui.area.style.display = 'none';
  if (ui.placeholder) ui.placeholder.style.display = 'flex';
}

// ── 로직: 기존 비즈니스 플로우 초기화 ──
function initExistingBusinessFlow() {
  if (!copilotData || !ui.selects.industry) return;

  // 1. 산업 드롭다운 채우기
  ui.selects.industry.innerHTML = '<option value="">산업군 선택</option>';
  copilotData.industries.forEach((ind, idx) => {
    ui.selects.industry.innerHTML += `<option value="${idx}">${ind.name}</option>`;
  });

  // 이벤트: 산업 선택 시 -> 카테고리 활성화
  ui.selects.industry.addEventListener('change', (e) => {
    const idx = e.target.value;
    currentState.industry = idx !== "" ? copilotData.industries[idx] : null;
    currentState.category = null;
    currentState.task = null;

    ui.selects.category.innerHTML = '<option value="">세부 업무 카테고리 선택</option>';
    ui.selects.task.innerHTML = '<option value="">해결하고 싶은 단위 업무 선택</option>';
    ui.radios.innerHTML = '';
    ui.buttons.nextToTask.disabled = true;

    if (currentState.industry) {
      ui.selects.category.disabled = false;
      currentState.industry.categories.forEach((cat, cIdx) => {
        ui.selects.category.innerHTML += `<option value="${cIdx}">${cat.name}</option>`;
      });
    } else {
      ui.selects.category.disabled = true;
      ui.selects.category.innerHTML = '<option value="">세부 업무 카테고리 선택 (산업군 먼저 선택)</option>';
    }
  });

  // 이벤트: 카테고리 선택 시 -> '다음' 버튼 활성화
  ui.selects.category.addEventListener('change', (e) => {
    const idx = e.target.value;
    if (idx !== "" && currentState.industry) {
      currentState.category = currentState.industry.categories[idx];
      ui.buttons.nextToTask.disabled = false;
    } else {
      currentState.category = null;
      ui.buttons.nextToTask.disabled = true;
    }
  });

  // 이벤트: '다음 단계로' 버튼 클릭 -> Task 선택 화면으로 이동
  ui.buttons.nextToTask?.addEventListener('click', () => {
    if (!currentState.category) return;
    showStep('painpoint');

    // Task 드롭다운 채우기
    ui.selects.task.innerHTML = '<option value="">해결하고 싶은 단위 업무 선택</option>';
    currentState.category.tasks.forEach((task, tIdx) => {
      ui.selects.task.innerHTML += `<option value="${tIdx}">${task.name}</option>`;
    });

    ui.radios.innerHTML = '';
    ui.buttons.generateExisting.disabled = true;
  });

  // 이벤트: 뒤로가기
  ui.buttons.backToIndustry?.addEventListener('click', () => {
    showStep('industry');
  });

  // 이벤트: Task 선택 시 -> Pain point 라디오 렌더링
  ui.selects.task.addEventListener('change', (e) => {
    const idx = e.target.value;
    ui.radios.innerHTML = '';
    ui.buttons.generateExisting.disabled = true;
    currentState.painPoint = null;

    if (idx !== "" && currentState.category) {
      currentState.task = currentState.category.tasks[idx];

      // 라디오 버튼 렌더링
      if (currentState.task.painPoints) {
        currentState.task.painPoints.forEach((pp, pIdx) => {
          const lbl = document.createElement('label');
          lbl.className = 'painpoint-radio';
          lbl.innerHTML = `
            <input type="radio" name="painpoint" value="${pIdx}">
            <span style="font-size: 0.9rem; color: var(--text-1);">${pp}</span>
          `;
          lbl.addEventListener('click', () => {
            document.querySelectorAll('.painpoint-radio').forEach(r => r.classList.remove('selected'));
            lbl.classList.add('selected');
            currentState.painPoint = pp;
            ui.buttons.generateExisting.disabled = false;
          });
          ui.radios.appendChild(lbl);
        });
      }
    } else {
      currentState.task = null;
    }
  });
}

// ── 결과 렌더링 ──
function renderExistingResult(taskData) {
  let html = `<div class="copilot-result fade-in" style="background: rgba(20,20,30,0.8); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-top: 24px;">`;
  html += `<p style="color:var(--cyan-light); font-size: 0.85rem; font-weight:800; margin-bottom:8px;">[🚀 진단 결과: 맞춤형 자동화 솔루션]</p>`;
  html += `<h3 style="margin-bottom: 12px; color:white;">${taskData.recommendedTemplate}</h3>`;

  // Pain point 요약
  if (currentState.painPoint) {
    html += `<div style="margin-bottom: 16px; padding: 12px; border-left: 3px solid #f87171; background: rgba(248, 113, 113, 0.1);">
              <p style="font-size: 0.85rem; color: var(--text-2); margin-bottom: 4px;">🎯 해결하려는 핵심 문제</p>
              <p style="font-size: 0.9rem; font-weight: 500;">"${currentState.painPoint}"</p>
             </div>`;
  }

  // 프로세스 설명
  html += `<p style="color:var(--text-1); font-size:0.95rem; margin-bottom: 24px; line-height: 1.6;">${taskData.process}</p>`;

  // 다이어그램 영역 (n8n Output)
  html += `
    <div style="background: rgba(0,0,0,0.4); border-radius: 12px; padding: 16px;">
      <p style="font-size: 0.8rem; color:var(--text-3); margin-bottom: 12px; font-weight: 600;">EXPECTED OUTCOME</p>
      <div style="background: rgba(6, 182, 212, 0.1); border: 1px dashed rgba(6, 182, 212, 0.4); padding: 16px; border-radius: 8px;">
        <span style="font-size: 1.2rem; margin-right: 8px;">✨</span>
        <span style="font-weight: 700; color: var(--cyan-light);">${taskData.n8n_output}</span>
      </div>
    </div>
  `;
  html += `</div>`;
  return html;
}

function renderSoloResult() {
  let html = `<div class="copilot-result fade-in" style="background: rgba(20,20,30,0.8); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-top: 24px;">`;
  html += `<p style="color:var(--purple-light); font-size: 0.85rem; font-weight:800; margin-bottom:8px;">[🚀 1인 비즈니스 설계 진단]</p>`;
  html += `<h3 style="margin-bottom: 12px; color:white;">AI 네이티브 솔로프리너 스택</h3>`;
  html += `<p style="color:var(--text-2); font-size:0.95rem; margin-bottom: 20px;">입력해주신 자산을 바탕으로 가장 빠르고 효과적인 1인 비즈니스 셋업을 추천합니다.</p>`;

  // Antigravity Stack Visualization
  const stack = ['Antigravity', 'Claude Code', 'Pencil', 'n8n', 'Vercel'];
  html += `
    <div style="background: rgba(0,0,0,0.4); border-radius: 12px; padding: 16px;">
      <p style="font-size: 0.8rem; color:var(--text-3); margin-bottom: 12px; font-weight: 600;">THE ANTIGRAVITY STACK</p>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        ${stack.map(s => {
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

// ── 이벤트 핸들링: 메인 로직 ──
document.addEventListener('DOMContentLoaded', () => {
  // 0. 데이터 로드
  loadCopilotData();

  // 1. 트랙 선택버튼
  ui.buttons.trackBtns?.forEach(btn => {
    btn.addEventListener('click', () => {
      const track = btn.dataset.track;
      currentState.track = track;
      if (track === 'existing') {
        showStep('industry');
      } else {
        showStep('solo');
      }
    });
  });

  // 솔로 뒤로가기
  ui.buttons.backToTrackSolo?.addEventListener('click', () => {
    showStep('track');
  });

  // 완료 (Existing)
  ui.buttons.generateExisting?.addEventListener('click', () => {
    if (!currentState.task) return;
    const btn = ui.buttons.generateExisting;
    btn.disabled = true;
    btn.innerHTML = '<span>분석 중...</span><span class="btn-icon">⏳</span>';

    setTimeout(() => {
      ui.placeholder.style.display = 'none';
      ui.area.style.display = 'block';
      ui.area.innerHTML = renderExistingResult(currentState.task);
      btn.disabled = false;
      btn.innerHTML = '솔루션 진단 완료하기 🚀';
    }, 800);
  });

  // 완료 (Solo)
  ui.buttons.generateSolo?.addEventListener('click', () => {
    const val = document.getElementById('process-input-solo')?.value || '';
    if (!val.trim()) {
      alert('키워드를 입력해주세요.');
      return;
    }
    const btn = ui.buttons.generateSolo;
    btn.disabled = true;
    btn.innerHTML = '<span>분석 중...</span><span class="btn-icon">⏳</span>';

    setTimeout(() => {
      ui.placeholder.style.display = 'none';
      ui.area.style.display = 'block';
      ui.area.innerHTML = renderSoloResult();
      btn.disabled = false;
      btn.innerHTML = '내 비즈니스 스택 확인하기 🚀';
    }, 800);
  });
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
