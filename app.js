// Preliminary COJ-informed project intake. Final requirements require City confirmation.
const ITEMS = {
  summary: ['Prepare a concise project description and intended use', 'Prepare or collect', 'Project intake needs a clear scope description.', 'COJ IMPACT routing questionnaire'],
  address: ['Verify project address, parcel, and suite or unit number', 'Prepare or collect', 'Location information supports City routing.', 'COJ IMPACT routing questionnaire'],
  cou: ['Include Certificate of Use (COU) in the preliminary permit matrix', 'Preliminary permit matrix', 'A change in business use was identified.', 'COJ rules table: change in business use'],
  convert: ['Include Change of Use Building Permit in the preliminary permit matrix', 'Preliminary permit matrix', 'A change in occupancy classification was identified.', 'COJ rules table: occupancy classification change'],
  building: ['Include Building Permit in the preliminary permit matrix', 'Preliminary permit matrix', 'Interior construction or alterations were identified.', 'COJ rules table: interior construction'],
  plumbing: ['Include Plumbing Permit in the preliminary permit matrix', 'Preliminary permit matrix', 'New or modified plumbing work was identified.', 'COJ rules table: new plumbing'],
  site: ['Include Civil review / Site-Work Permit in the preliminary permit matrix', 'Preliminary permit matrix', 'Site work was identified.', 'COJ rules table: site work'],
  row: ['Include Right-of-Way Permit in the preliminary permit matrix', 'Preliminary permit matrix', 'Public right-of-way work was identified.', 'COJ rules table: City right-of-way work'],
  mechanical: ['Confirm mechanical/HVAC review and permit requirements', 'City confirmation needed', 'Mechanical work was identified.', 'COJ IMPACT routing questionnaire'],
  electrical: ['Confirm electrical review and permit requirements', 'City confirmation needed', 'Electrical work was identified.', 'COJ IMPACT routing questionnaire'],
  fire: ['Confirm Fire Prevention review requirements', 'City confirmation needed', 'Fire protection or special conditions were identified.', 'COJ IMPACT routing questionnaire'],
  coordinator: ['Review the preliminary permit matrix with the COJ Permit Coordinator', 'City confirmation needed', 'Final requirements are determined with City staff.', 'COJ IMPACT workflow']
}
const yesNo = (add, next) => [{ label: 'Yes', value: 'yes', add: add, next: next }, { label: 'No', value: 'no', next: next }, { label: 'Unsure', value: 'unsure', add: ['coordinator'], next: next }]
const QUESTIONS = [
  { id: 'type', label: 'What is the primary project type?', helper: 'This creates a preliminary coordination record, not a final City determination.', options: [
    { label: 'New construction', value: 'new', add: ['summary', 'address', 'coordinator'], next: 'business' },
    { label: 'Addition, expansion, or renovation', value: 'renovation', add: ['summary', 'address', 'coordinator'], next: 'business' },
    { label: 'Change of business use or occupancy', value: 'changeUse', add: ['summary', 'address', 'coordinator'], next: 'business' },
    { label: 'Site improvement only', value: 'siteOnly', add: ['summary', 'address', 'coordinator'], next: 'site' }
  ] },
  { id: 'business', label: 'Will the business use change, expand, relocate, or add another use?', helper: 'A yes response adds a COU to the preliminary permit matrix.', options: yesNo(['cou'], 'occupancy') },
  { id: 'occupancy', label: 'Will the occupancy classification change?', options: yesNo(['convert'], 'interior') },
  { id: 'interior', label: 'Will the project include interior construction or alterations?', options: yesNo(['building'], 'mechanical') },
  { id: 'mechanical', label: 'Are mechanical or HVAC systems being changed?', options: yesNo(['mechanical'], 'electrical') },
  { id: 'electrical', label: 'Are electrical systems being changed?', options: yesNo(['electrical'], 'plumbing') },
  { id: 'plumbing', label: 'Is new or modified plumbing work proposed?', options: yesNo(['plumbing'], 'fire') },
  { id: 'fire', label: 'Are fire protection systems, commercial cooking, hazardous materials, or special occupancy conditions involved?', options: yesNo(['fire'], 'site') },
  { id: 'site', label: 'Will work affect parking, access, drainage, utilities, landscaping, sidewalks, or driveways?', options: yesNo(['site'], 'row') },
  { id: 'row', label: 'Will work occur in the public right-of-way?', options: yesNo(['row'], undefined) }
]
const LABELS = { type: 'Project type', business: 'Business use change', occupancy: 'Occupancy classification change', interior: 'Interior construction', mechanical: 'Mechanical changes', electrical: 'Electrical changes', plumbing: 'Plumbing changes', fire: 'Fire / special conditions', site: 'Site impacts', row: 'Public right-of-way work' }
const PRETTY = { new: 'New construction', renovation: 'Addition, expansion, or renovation', changeUse: 'Change of business use or occupancy', siteOnly: 'Site improvement only', yes: 'Yes', no: 'No', unsure: 'Unsure' }
let answers = {}, step = 0, started = false, results = false, completed = new Set()
const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
const findQuestion = id => QUESTIONS.find(question => question.id === id)
function activePath() {
  const result = []; let id = QUESTIONS[0].id
  while (id) { const question = findQuestion(id); if (!question) break; result.push(question); const choice = question.options.find(option => option.value === answers[id]); id = choice && choice.next }
  return result
}
function isComplete() { const route = activePath(), last = route[route.length - 1]; return !!last && route.every(question => answers[question.id]) && !last.options.find(option => option.value === answers[last.id]).next }
function currentItems() { const ids = new Set(); activePath().forEach(question => { const choice = question.options.find(option => option.value === answers[question.id]); if (choice && choice.add) choice.add.forEach(id => ids.add(id)) }); return [...ids] }
function button(text, action, cls, disabled) { return '<button type="button" class="button ' + cls + '" data-action="' + action + '"' + (action === 'start' ? ' data-a="start"' : '') + (disabled ? ' disabled' : '') + '>' + text + '</button>' }
function header() { return '<header class="app-header"><div class="eyebrow">CITY OF JACKSONVILLE · PROJECT INTAKE</div><h1>Preliminary Permit Routing</h1><p>COJ-informed screening for project coordination and document planning.</p></header>' }
function renderLanding() { return '<main class="shell landing">' + header() + '<section class="landing-card"><div class="landing-mark">COJ</div><div class="question-kicker">PROJECT INTAKE</div><h2>Prepare for a more informed City review.</h2><p>Answer focused scope questions to create a preliminary permit matrix and review record.</p>' + button('Begin intake →', 'start', 'primary large') + '<small>For preliminary coordination only. Final requirements are determined by the City of Jacksonville.</small></section></main>' }
function renderQuestion() {
  const route = activePath(), question = route[step], percent = Math.min(96, Math.round(step / Math.max(1, QUESTIONS.length - 1) * 100))
  return '<main class="shell">' + header() + '<section class="progress"><div class="progress-copy"><span>Step ' + (step + 1) + '</span><span>Your intake is being built as you answer.</span></div><div class="progress-track"><div class="progress-fill" style="width:' + percent + '%"></div></div></section><div class="status"><span><strong>' + Object.keys(answers).length + '</strong> Answers recorded</span><span><strong>' + currentItems().length + '</strong> Preliminary action items</span></div><section class="question-card"><div class="question-kicker">PROJECT QUESTION</div><h2>' + escapeHtml(question.label) + '</h2>' + (question.helper ? '<p class="helper">' + escapeHtml(question.helper) + '</p>' : '') + '<div class="options">' + question.options.map(option => '<button type="button" class="option ' + (answers[question.id] === option.value ? 'selected' : '') + '" data-answer="' + option.value + '"><span class="radio-dot"></span><span>' + escapeHtml(option.label) + '</span><span class="arrow">→</span></button>').join('') + '</div></section><nav class="navigation">' + button('← Back', 'back', 'secondary', step === 0) + button(step === route.length - 1 ? 'Review checklist →' : 'Next →', 'next', 'primary', !answers[question.id]) + '</nav></main>'
}
function recordText() { return currentItems().map(id => (completed.has(id) ? '[x] ' : '[ ] ') + ITEMS[id][0] + '\nWhy: ' + ITEMS[id][2] + '\nSource: ' + ITEMS[id][3]).join('\n\n') + '\n\nINTAKE ANSWERS\n' + Object.entries(answers).map(([id, value]) => (LABELS[id] || id) + ': ' + (PRETTY[value] || value)).join('\n') }
function renderResults() {
  const groups = {}; currentItems().forEach(id => { const name = ITEMS[id][1]; (groups[name] || (groups[name] = [])).push(id) })
  const body = Object.entries(groups).map(([name, ids]) => '<section class="outcome-group"><div class="outcome-heading"><h3>' + name + '</h3></div><section class="checklist-section">' + ids.map(id => '<label class="check-item ' + (completed.has(id) ? 'done' : '') + '"><input type="checkbox" data-check="' + id + '"' + (completed.has(id) ? ' checked' : '') + '><span class="box">✓</span><span class="item-copy"><strong>' + escapeHtml(ITEMS[id][0]) + '</strong><span class="item-reason">Why this appears: ' + escapeHtml(ITEMS[id][2]) + '</span><span class="item-source">Source: ' + escapeHtml(ITEMS[id][3]) + '</span></span></label>').join('') + '</section></section>').join('')
  const summary = Object.entries(answers).map(([id, value]) => '<div><span>' + escapeHtml(LABELS[id] || id) + '</span><strong>' + escapeHtml(PRETTY[value] || value) + '</strong></div>').join('')
  return '<main class="shell">' + header() + '<section class="results"><div class="results-heading"><div><div class="question-kicker">PRELIMINARY RESULTS</div><h2>Permit & document checklist</h2><p>A transparent, COJ-informed screening record for City coordination.</p></div><div class="result-count">' + currentItems().length + '<span>action items</span></div></div><aside class="disclaimer"><strong>Not a City determination.</strong> Final permit requirements are determined with the COJ Permit Coordinator and relevant City staff.</aside><div class="checklist">' + body + '</div><section class="answer-summary"><h3>Intake record</h3>' + summary + '</section><section class="delivery-card"><div class="question-kicker">FINAL DOCUMENTATION</div><h3>Email this record</h3><p>Prepare an email containing the checklist and intake answers.</p><div class="email-request"><label for="checklist-email">Email address</label><div><input id="checklist-email" type="email" placeholder="you@company.com"><button class="button primary" type="button" data-action="email">Prepare email</button></div><p class="email-notice" id="email-notice"></p></div></section><div class="result-actions">' + button('Edit answers', 'edit', 'secondary') + button('Start new intake', 'restart', 'secondary') + button('Print record', 'print', 'secondary') + button('Copy record', 'copy', 'primary') + '</div></section></main>'
}
function render() { document.querySelector('#root').innerHTML = !started ? renderLanding() : results && isComplete() ? renderResults() : renderQuestion(); bind() }
function bind() {
  document.querySelectorAll('[data-answer]').forEach(control => control.onclick = () => { answers[activePath()[step].id] = control.dataset.answer; results = false; render() })
  document.querySelectorAll('[data-check]').forEach(control => control.onchange = () => { control.checked ? completed.add(control.dataset.check) : completed.delete(control.dataset.check); render() })
  document.querySelectorAll('[data-action]').forEach(control => control.onclick = async () => {
    const action = control.dataset.action
    if (action === 'start') started = true
    else if (action === 'back') step = Math.max(0, step - 1)
    else if (action === 'next') { if (step < activePath().length - 1) step += 1; else results = true }
    else if (action === 'edit') { results = false; step = 0 }
    else if (action === 'restart') { answers = {}; step = 0; started = false; results = false; completed = new Set(); sessionStorage.removeItem('checklistProjectDetails') }
    else if (action === 'print') window.print()
    else if (action === 'copy') { try { await navigator.clipboard.writeText(recordText()); alert('Record copied to clipboard.') } catch { alert('Copy is unavailable. Use Print record instead.') } }
    else if (action === 'email') { const email = document.querySelector('#checklist-email').value.trim(), notice = document.querySelector('#email-notice'); if (!email || !email.includes('@')) { notice.textContent = 'Enter a valid email address.'; return } window.location.href = 'mailto:?subject=' + encodeURIComponent('Preliminary COJ-Informed Checklist') + '&body=' + encodeURIComponent('Please send this record to ' + email + '.\n\n' + recordText()); notice.textContent = 'Your email app has opened with the record ready to send.'; return }
    render()
  })
}
render()
