// Project-information screen layered onto the no-build checklist application.
(() => {
  const escape = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char])
  const showDetails = startButton => {
    const root = document.querySelector('#root')
    root.innerHTML = `<main class="shell">${document.querySelector('.app-header')?.outerHTML || '<header class="app-header"><div class="eyebrow">PROJECT READINESS</div><h1>Checklist Generator</h1><p>Build a clear, project-specific action list.</p></header>'}<section class="question-card"><div class="question-kicker">PROJECT INFORMATION</div><h2>Tell us about the project.</h2><p class="helper">These details appear on your generated checklist and help identify the project during review.</p><form id="project-details" class="project-form"><label>Project name<input name="projectName" required placeholder="e.g., Riverside Tenant Build-out"></label><label>Project location / address<input name="location" required placeholder="Street address, suite, or parcel"></label><label>Owner or client name<input name="owner" required placeholder="Owner, business, or organization"></label><label>Primary contact<input name="contact" placeholder="Name, email, or phone"></label><div class="navigation"><span></span><button class="button primary" type="submit">Continue to Questions &rarr;</button></div></form></section></main>`
    document.querySelector('#project-details').onsubmit = event => {
      event.preventDefault()
      const form = new FormData(event.currentTarget)
      sessionStorage.setItem('checklistProjectDetails', JSON.stringify(Object.fromEntries(form.entries())))
      startButton.onclick()
    }
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-a="start"]')
    if (!button || sessionStorage.getItem('checklistProjectDetails')) return
    event.preventDefault(); event.stopImmediatePropagation(); showDetails(button)
  }, true)
  const addSummary = () => {
    const target = document.querySelector('.answer-summary')
    const raw = sessionStorage.getItem('checklistProjectDetails')
    if (!target || !raw || target.querySelector('.project-summary')) return
    const d = JSON.parse(raw)
    target.insertAdjacentHTML('afterbegin', `<div class="project-summary"><h3>Project information</h3><div><span>Project Name</span><strong>${escape(d.projectName)}</strong></div><div><span>Location</span><strong>${escape(d.location)}</strong></div><div><span>Owner / Client</span><strong>${escape(d.owner)}</strong></div>${d.contact ? `<div><span>Primary Contact</span><strong>${escape(d.contact)}</strong></div>` : ''}</div>`)
  }
  new MutationObserver(addSummary).observe(document.body, { childList: true, subtree: true })
})()
