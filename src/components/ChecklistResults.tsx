import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { AnswerMap, ChecklistItem, CityContact, Outcome } from '../types/checklist'
import { ChecklistSection } from './ChecklistSection'
import { coordinationRoutes } from '../data/checklistRules'

const labels: Record<string, string> = { projectType: 'Project Type', businessUseChange: 'Business Use Change', occupancyChange: 'Occupancy Classification Change', interiorConstruction: 'Interior Construction', mechanicalChanges: 'Mechanical Changes', electricalChanges: 'Electrical Changes', plumbingChanges: 'Plumbing Changes', fireConditions: 'Fire / Special Conditions', signWork: 'Sign Work', siteImpacts: 'Site Impacts', rightOfWay: 'Public Right-of-Way Work', knownIssues: 'Known Project Risks', previousSubmission: 'Previous City Submission', commercialPlanReview: 'Commercial Plan Review', assistedLivingFacility: 'Assisted Living Facility', civilAcceptance: 'Civil Acceptance / Approval Work' }
const pretty = (value: string) => ({ new: 'New Construction', renovation: 'Renovation / Tenant Build-out', addition: 'Addition or Expansion', changeUse: 'Change of Use / Occupancy', siteOnly: 'Site Improvement Only', yes: 'Yes', no: 'No', unsure: 'Unsure' }[value] ?? value)
const outcomeCopy: Record<Outcome, { title: string; description: string }> = {
  'preliminary-route': { title: 'Preliminary permit matrix', description: 'These routing outcomes are directly supported by the COJ rules table. They remain subject to City confirmation.' },
  'review-flag': { title: 'City confirmation needed', description: 'These conditions need review with the Permit Coordinator or relevant City staff before a requirement is confirmed.' },
  preparation: { title: 'Prepare or collect', description: 'These are project-record or document-preparation items to have available for the review conversation.' },
  specialized: { title: 'Separate specialized workflow', description: 'These are not general construction requirements. Use the named checklist only for this specific use case.' }
}
const outcomeOrder: Outcome[] = ['preliminary-route', 'review-flag', 'preparation', 'specialized']
const emailIsValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const contacts: Record<string, CityContact> = {
  building: { id: 'building', department: 'Building Inspection Division', purpose: 'Commercial building, electrical, mechanical, and plumbing permits or inspections', email: 'BIDDocuments@coj.net', phone: '(904) 255-8500' },
  zoning: { id: 'zoning', department: 'Development Services — Zoning', purpose: 'Zoning, Certificate of Use, setbacks, and land-use questions', email: 'Zoning@coj.net', phone: '(904) 255-8300' },
  development: { id: 'development', department: 'Development Services — Review Group', purpose: 'Site development, driveway, right-of-way, drainage, and civil-plan review', email: 'ReviewGrp@coj.net', phone: '(904) 255-8310' },
  fire: { id: 'fire', department: 'Jacksonville Fire & Rescue — Plan Review', purpose: 'Fire permits, commercial cooking, life safety, and fire-protection plan review', email: 'HPadgett@coj.net', phone: '(904) 255-8562' },
  environmental: { id: 'environmental', department: 'Environmental Quality Division', purpose: 'Construction-site erosion and sediment-control questions', email: 'ESC@coj.net' }
}

function relevantContacts(answers: AnswerMap, items: ChecklistItem[]): CityContact[] {
  const ids = new Set(items.map((item) => item.id))
  const needed = new Set<string>()
  if (answers.projectType !== 'siteOnly') needed.add('building')
  if (ids.has('cou') || ids.has('convertingUse') || ids.has('occupancyReview') || ids.has('zoningReview') || ids.has('riskCoordination')) needed.add('zoning')
  if (ids.has('sitePermit') || ids.has('rowPermit') || answers.projectType === 'new' || answers.projectType === 'siteOnly') needed.add('development')
  if (ids.has('fireReview') || ids.has('occupancyReview') || ids.has('cou')) needed.add('fire')
  if (ids.has('sitePermit') && answers.knownIssues === 'yes') needed.add('environmental')
  return [...needed].map((id) => contacts[id])
}

declare global {
  interface Window {
    turnstile?: { render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; 'expired-callback': () => void; 'error-callback': () => void }) => string }
  }
}

export function ChecklistResults({ items, notes, answers, projectName, projectLocation, onRestart, onEdit }: { items: ChecklistItem[]; notes: string[]; answers: AnswerMap; projectName: string; projectLocation: string; onRestart: () => void; onEdit: () => void }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [email, setEmail] = useState('')
  const [emailNotice, setEmailNotice] = useState('')
  const [requestOpen, setRequestOpen] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [requestNotice, setRequestNotice] = useState('')
  const [sendingRequest, setSendingRequest] = useState(false)
  const turnstileTarget = useRef<HTMLDivElement>(null)
  const byOutcome = useMemo(() => items.reduce<Record<Outcome, ChecklistItem[]>>((result, item) => { result[item.outcome].push(item); return result }, { 'preliminary-route': [], 'review-flag': [], preparation: [], specialized: [] }), [items])
  const coordinationRoute = coordinationRoutes[answers.projectType]
  const cityContacts = useMemo(() => relevantContacts(answers, items), [answers, items])
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
  useEffect(() => {
    if (!requestOpen || !turnstileSiteKey || !turnstileTarget.current) return
    const renderWidget = () => {
      if (turnstileTarget.current?.childElementCount === 0 && window.turnstile) window.turnstile.render(turnstileTarget.current, { sitekey: turnstileSiteKey, callback: setTurnstileToken, 'expired-callback': () => setTurnstileToken(''), 'error-callback': () => setTurnstileToken('') })
    }
    const existing = document.getElementById('turnstile-api') as HTMLScriptElement | null
    if (existing) { existing.addEventListener('load', renderWidget); renderWidget(); return () => existing.removeEventListener('load', renderWidget) }
    const script = document.createElement('script'); script.id = 'turnstile-api'; script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true; script.defer = true; script.addEventListener('load', renderWidget); document.head.appendChild(script)
    return () => script.removeEventListener('load', renderWidget)
  }, [requestOpen, turnstileSiteKey])
  const toggle = (id: string) => setCompleted((previous) => { const next = new Set(previous); next.has(id) ? next.delete(id) : next.add(id); return next })
  const coordinationText = `PROJECT DETAILS\nName: ${projectName}\nProject address or location: ${projectLocation}\n\n${coordinationRoute ? `CITY COORDINATION\nProject route: ${coordinationRoute.label}\nRecommended group: ${coordinationRoute.team}\n${cityContacts.map((contact) => `${contact.department}: ${contact.email}${contact.phone ? ` (${contact.phone})` : ''}`).join('\n')}\n` : ''}`
  const text = `PRELIMINARY COJ-INFORMED PERMIT AND DOCUMENT CHECKLIST\nGenerated ${new Date().toLocaleDateString()}\n\n${coordinationText}${outcomeOrder.filter((outcome) => byOutcome[outcome].length).map((outcome) => `${outcomeCopy[outcome].title.toUpperCase()}\n${byOutcome[outcome].map((entry) => `${completed.has(entry.id) ? '[x]' : '[ ]'} ${entry.label}\n    Why: ${entry.reason}\n    Source: ${entry.source}${entry.sourceLocation ? ` — ${entry.sourceLocation}` : ''}`).join('\n')}`).join('\n\n')}\n\nINTAKE ANSWERS\n${Object.entries(answers).map(([key, value]) => `${labels[key]}: ${pretty(value)}`).join('\n')}`
  const copy = async () => { await navigator.clipboard.writeText(text); window.alert('Checklist copied to clipboard.') }
  const requestEmail = () => {
    const recipient = email.trim()
    if (!emailIsValid(recipient)) { setEmailNotice('Enter a valid email address to prepare your request.'); return }
    window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent('Preliminary COJ-Informed Checklist')}&body=${encodeURIComponent(text)}`
    setEmailNotice('Your email app has opened with the checklist in the message body. Send it to deliver your copy.')
  }
  const submitCoordinationRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setRequestNotice('')
    if (!turnstileSiteKey) { setRequestNotice('City staff: configure Turnstile before enabling this form.'); return }
    if (!turnstileToken) { setRequestNotice('Please complete the verification before continuing.'); return }
    const form = new FormData(event.currentTarget)
    setSendingRequest(true)
    try {
      const response = await fetch('/api/coordination-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), email: form.get('email'), projectAddress: form.get('projectAddress'), message: form.get('message'), website: form.get('website'), route: coordinationRoute?.label, team: coordinationRoute?.team, turnstileToken }) })
      const data = await response.json() as { mailtoUrl?: string; message?: string }
      if (!response.ok || !data.mailtoUrl) throw new Error(data.message || 'Unable to verify the request.')
      window.location.href = data.mailtoUrl
      setRequestNotice('Verification complete. Your email app has opened with the request ready to send.')
    } catch (error) { setRequestNotice(error instanceof Error ? error.message : 'Unable to verify the request. Please try again.') }
    finally { setSendingRequest(false) }
  }
  return <section className="results">
    <div className="results-heading"><div><div className="question-kicker">PRELIMINARY RESULTS</div><h2>Permit & document checklist</h2><p>A transparent, COJ-informed screening record for your City coordination conversation.</p></div><div className="result-count">{items.length}<span>action items</span></div></div>
    <aside className="disclaimer"><strong>Not a City determination.</strong> This preliminary matrix identifies documented routing outcomes and review flags from the available source material. Final permit requirements are determined with the COJ Permit Coordinator and relevant City staff.</aside>
    {coordinationRoute && <section className="coordination-card" aria-labelledby="coordination-heading">
      <div className="question-kicker">CITY COORDINATION</div>
      <h3 id="coordination-heading">Your next City conversations</h3>
      <p>{coordinationRoute.description}</p>
      <div className="coordination-details">
        <div><span>Recommended group</span><strong>{coordinationRoute.team}</strong></div>
      </div>
      <div className="city-contact-list">{cityContacts.map((contact) => <section className="city-contact" key={contact.id}>
        <h4>{contact.department}</h4><p>{contact.purpose}</p>
        <a href={`mailto:${contact.email}`}>{contact.email}</a>{contact.phone && <span>{contact.phone}</span>}
      </section>)}</div>
      <small>Project route: {coordinationRoute.label}. Contact only the teams shown for the work identified in this intake; City staff confirm final routing.</small>
      <button className="button primary coordination-button" onClick={() => { setRequestOpen(true); setRequestNotice('') }}>Request City coordination</button>
    </section>}
    {requestOpen && coordinationRoute && <section className="request-card" aria-labelledby="request-heading">
      <div className="question-kicker">SECURE REQUEST</div><h3 id="request-heading">Request a coordination meeting</h3>
      <p>Verify that you are human, then your email application will open with a pre-filled request to the recommended City group.</p>
      <form onSubmit={submitCoordinationRequest} className="coordination-form">
        <label>Your name<input name="name" defaultValue={projectName} required autoComplete="name" /></label><label>Email address<input name="email" type="email" required autoComplete="email" /></label><label>Project address or parcel<input name="projectAddress" defaultValue={projectLocation} required autoComplete="street-address" /></label><label>What do you need help with?<textarea name="message" required rows={4} /></label>
        <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        {turnstileSiteKey ? <div ref={turnstileTarget} aria-label="Human verification" /> : <p className="email-notice">This form is not yet configured for public use.</p>}
        <button className="button primary" disabled={sendingRequest}>{sendingRequest ? 'Verifying…' : 'Verify and prepare request email'}</button>
        {requestNotice && <p className="email-notice" role="status">{requestNotice}</p>}
      </form>
    </section>}
    {notes.length > 0 && <aside className="notes"><strong>Follow-up notes</strong>{notes.map((note) => <p key={note}>{note}</p>)}</aside>}
    <div className="outcome-summary">{outcomeOrder.map((outcome) => <div key={outcome}><strong>{byOutcome[outcome].length}</strong><span>{outcomeCopy[outcome].title}</span></div>)}</div>
    <div className="checklist">{outcomeOrder.filter((outcome) => byOutcome[outcome].length).map((outcome) => <section className={`outcome-group ${outcome}`} key={outcome}><div className="outcome-heading"><h3>{outcomeCopy[outcome].title}</h3><p>{outcomeCopy[outcome].description}</p></div>{Object.entries(byOutcome[outcome].reduce<Record<string, ChecklistItem[]>>((result, entry) => { (result[entry.category] ??= []).push(entry); return result }, {})).map(([category, entries]) => <ChecklistSection key={category} title={category} items={entries} completed={completed} onToggle={toggle} />)}</section>)}</div>
    <section className="answer-summary"><h3>Intake record</h3><div><span>Name</span><strong>{projectName}</strong></div><div><span>Project address or location</span><strong>{projectLocation}</strong></div>{Object.entries(answers).map(([key, value]) => <div key={key}><span>{labels[key]}</span><strong>{pretty(value)}</strong></div>)}</section>
    <section className="delivery-card" aria-labelledby="delivery-heading"><div className="question-kicker">FINAL DOCUMENTATION</div><h3 id="delivery-heading">Send or retain this record</h3><p>Enter your email to prepare a message containing the checklist, its rationale, sources, and intake answers.</p><div className="email-request"><label htmlFor="checklist-email">Email address</label><div><input id="checklist-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setEmailNotice('') }} placeholder="you@company.com" autoComplete="email" /><button className="button primary" onClick={requestEmail}>Prepare email</button></div>{emailNotice && <p className="email-notice" role="status">{emailNotice}</p>}</div><small>This version opens a pre-filled email draft. Automatic delivery requires an approved secure email service.</small></section>
    <div className="result-actions"><button className="button secondary" onClick={onEdit}>Edit answers</button><button className="button secondary" onClick={onRestart}>Start new intake</button><button className="button secondary" onClick={() => window.print()}>Print record</button><button className="button primary" onClick={copy}>Copy record</button></div>
  </section>
}
