"""
diagnosis.html 빌드 스크립트
참고 파일에 N8N JSON 생성 + 이메일 발송 기능을 추가합니다.
"""
import re

SRC = r"C:\Users\장우경\Downloads\antigravity-diagnosis-form.html"
OUT = r"C:\Users\장우경\.gemini\antigravity\automation-n8n\website\diagnosis.html"

N8N_WEBHOOK = "http://localhost:5678/webhook/diagnosis-submit"

N8N_JS = """
/* ── N8N 진단 결과 처리 ── */
function generateN8NWorkflow(data) {
  const ts = Date.now();
  const triggerMap = {
    'trig_1': 'n8n-nodes-base.scheduleTrigger',
    'trig_2': 'n8n-nodes-base.emailReadImap',
    'trig_3': 'n8n-nodes-base.webhook',
    'trig_5': 'n8n-nodes-base.webhook',
    'trig_8': 'n8n-nodes-base.manualTrigger',
  };
  const outputNodes = [];
  if (data.outputs.includes('이메일')) outputNodes.push('n8n-nodes-base.emailSend');
  if (data.outputs.includes('슬랙')) outputNodes.push('n8n-nodes-base.slack');
  if (data.outputs.includes('문서')) outputNodes.push('n8n-nodes-base.googleDrive');
  if (data.outputs.includes('DB')) outputNodes.push('n8n-nodes-base.postgres');

  const workflow = {
    name: data.company + ' — 자동화 플로우 (AntiGravity 설계)',
    nodes: [
      { id: 'trigger-1', name: '트리거', type: 'n8n-nodes-base.webhook',
        typeVersion: 2, position: [240, 300],
        parameters: { path: 'auto-' + ts, responseMode: 'onReceived' } },
      { id: 'set-1', name: '데이터 가공',  type: 'n8n-nodes-base.set',
        typeVersion: 3, position: [480, 300], parameters: {} },
      { id: 'email-1', name: '결과 발송', type: 'n8n-nodes-base.emailSend',
        typeVersion: 2, position: [720, 300],
        parameters: { toEmail: data.email, subject: '[자동화 완료] ' + data.company, message: '자동화 처리가 완료되었습니다.' } }
    ],
    connections: {
      '트리거': { main: [[{ node: '데이터 가공', type: 'main', index: 0 }]] },
      '데이터 가공': { main: [[{ node: '결과 발송', type: 'main', index: 0 }]] }
    },
    settings: { executionOrder: 'v1' },
    meta: {
      generatedBy: 'AntiGravity 자동화 진단 시스템',
      company: data.company, industry: data.industry,
      core_task: data.core_task, generated_at: new Date().toISOString()
    }
  };
  return workflow;
}

function collectFormData() {
  const getVal = id => (document.getElementById(id) || {}).value || '';
  const getChecked = name => [...document.querySelectorAll('input[name="' + name + '"]:checked')].map(el => el.nextElementSibling?.textContent?.trim() || el.id).join(', ');
  const getCheckboxes = prefix => [...document.querySelectorAll('input[id^="' + prefix + '"]:checked')].map(el => el.nextElementSibling?.textContent?.trim() || '').join(', ');
  return {
    company: getVal('company_name'),
    contact: getVal('contact_name'),
    email: getVal('contact_email'),
    phone: getVal('contact_phone'),
    role: getVal('contact_role'),
    industry: getChecked('industry'),
    company_size: getChecked('company_size'),
    core_task: getVal('core_task'),
    bottleneck: getVal('bottleneck'),
    frequency: getChecked('frequency'),
    people: getVal('people_count'),
    hours: getVal('hours_week'),
    triggers: getCheckboxes('trig_'),
    outputs: getCheckboxes('out_'),
    budget: getChecked('budget'),
    timeline: getChecked('timeline'),
    extra_notes: getVal('extra_notes'),
    submitted_at: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
  };
}

async function submitForm() {
  const data = collectFormData();
  if (!data.email) { alert('이메일 주소를 입력해주세요.'); return; }
  if (!data.company) { alert('회사명을 입력해주세요.'); return; }

  // 폼 화면 숨기기
  for (let i = 0; i < SECTIONS; i++) {
    document.getElementById('section-' + i).classList.remove('active');
  }
  document.querySelector('.hero').style.display = 'none';
  document.querySelector('.progress-bar').style.display = 'none';
  document.getElementById('sideIndicator').style.display = 'none';
  document.getElementById('completeScreen').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // N8N 워크플로우 JSON 생성
  const workflow = generateN8NWorkflow(data);
  const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const downloadBtn = document.getElementById('download-workflow');
  if (downloadBtn) {
    downloadBtn.href = url;
    downloadBtn.download = data.company.replace(/\\s/g, '_') + '_n8n_flow.json';
    downloadBtn.style.display = 'inline-flex';
  }

  // N8N 웹훅으로 전송 시도
  try {
    await fetch('""" + N8N_WEBHOOK + """', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      mode: 'no-cors', body: JSON.stringify({ body: data })
    });
  } catch(e) { console.log('Webhook 오프라인 (로컬 N8N 미실행)'); }
}
"""

DOWNLOAD_BTN = """
  <div class="result-box">
    <div class="result-item"><span class="key">예상 분석 완료</span><span class="val">24시간 이내</span></div>
    <div class="result-item"><span class="key">제공 내용</span><span class="val">자동화 플로우 + ROI 분석</span></div>
    <div class="result-item"><span class="key">다음 단계</span><span class="val">이메일 확인 후 상담 예약</span></div>
  </div>
  <a id="download-workflow" style="display:none;margin:16px auto;padding:14px 32px;background:linear-gradient(135deg,#00e5ff,#7b2fff);color:#000;font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;border-radius:3px;text-decoration:none;font-weight:700;" href="#">⬇ N8N 워크플로우 JSON 다운로드</a>
  <p style="font-size:13px;color:var(--text-muted);margin-top:16px">문의: <span style="color:var(--accent)">yongal74@gmail.com</span></p>
"""

with open(SRC, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. 기존 submitForm 함수 제거
html = re.sub(r'function submitForm\(\)\s*\{[^}]*\}', '', html)

# 2. </script> 앞에 N8N JS 삽입
html = html.replace('</script>', N8N_JS + '\n  updateIndicators();\n</script>')

# 3. updateIndicators 중복 제거
html = html.replace('\n  updateIndicators();\n  updateIndicators();', '\n  updateIndicators();')

# 4. 결과 박스 교체
old_result = '''  <div class="result-box">
    <div class="result-item">
      <span class="key">예상 분석 완료</span>
      <span class="val">24시간 이내</span>
    </div>
    <div class="result-item">
      <span class="key">제공 내용</span>
      <span class="val">자동화 플로우 + ROI 분석</span>
    </div>
    <div class="result-item">
      <span class="key">다음 단계</span>
      <span class="val">이메일 확인 후 상담 예약</span>
    </div>
  </div>

  <p style="font-size:13px;color:var(--text-muted)">
    문의사항: <span style="color:var(--accent)">hello@antigravity.ai</span>
  </p>'''
html = html.replace(old_result, DOWNLOAD_BTN)

# 5. 타이틀/헤더 업데이트
html = html.replace('<title>AntiGravity — 업무 자동화 진단</title>',
                    '<title>장우경 | 업무 자동화 진단 — AntiGravity</title>')
html = html.replace('hello@antigravity.ai', 'yongal74@gmail.com')

# 6. 홈으로 돌아가는 링크 추가
html = html.replace('<div class="logo">ANTI<span>GRAVITY</span></div>',
                    '<a href="index.html" style="text-decoration:none"><div class="logo">ANTI<span>GRAVITY</span></div></a>')

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"✅ diagnosis.html 생성 완료: {OUT}")
print(f"   N8N Webhook: {N8N_WEBHOOK}")
