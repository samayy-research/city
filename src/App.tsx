import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { ProgressBar } from './components/ProgressBar'
import { QuestionCard } from './components/QuestionCard'
import { ChecklistResults } from './components/ChecklistResults'
import { generateChecklist, getApplicableQuestions, isComplete, sanitizeAnswers } from './engine/checklistEngine'
import { questions } from './data/checklistRules'
import type { AnswerMap } from './types/checklist'

export default function App() {
  const [started, setStarted] = useState(false)
  const [projectDetailsComplete, setProjectDetailsComplete] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectLocation, setProjectLocation] = useState('')
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [index, setIndex] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const applicable = useMemo(() => getApplicableQuestions(answers), [answers])
  const question = applicable[index]
  const complete = isComplete(answers)
  const result = useMemo(() => generateChecklist(answers), [answers])

  const update = (value: string) => {
    if (!question) return
    const nextAnswers = sanitizeAnswers({ ...answers, [question.id]: value })
    setAnswers(nextAnswers)
    setShowResults(false)
    setIndex(Math.min(index, getApplicableQuestions(nextAnswers).length - 1))
  }
  const next = () => {
    if (index < applicable.length - 1) setIndex(index + 1)
    else if (complete) setShowResults(true)
  }
  const restart = () => { setAnswers({}); setIndex(0); setShowResults(false); setProjectDetailsComplete(false); setProjectName(''); setProjectLocation(''); setStarted(false) }

  if (!started) return <main className="shell landing"><Header /><section className="landing-card"><div className="landing-mark">COJ</div><div className="question-kicker">PROJECT INTAKE</div><h2>Prepare for a more informed City review.</h2><p>Answer focused scope questions to create a preliminary permit matrix, review flags, and document-preparation record.</p><button className="button primary large" onClick={() => setStarted(true)}>Begin intake <span>-&gt;</span></button><small>For preliminary coordination only. Final requirements are determined by the City of Jacksonville.</small></section></main>

  return <main className="shell"><Header />
    {!projectDetailsComplete ? <section className="question-card">
      <div className="question-kicker">PROJECT DETAILS</div><h2>Start with your project information.</h2><p className="helper">This information is included in your intake record and pre-fills the coordination request form.</p>
      <form className="project-form" onSubmit={(event) => { event.preventDefault(); setProjectDetailsComplete(true) }}>
        <label>Your name<input value={projectName} onChange={(event) => setProjectName(event.target.value)} required autoComplete="name" /></label>
        <label>Project address or location<input value={projectLocation} onChange={(event) => setProjectLocation(event.target.value)} required autoComplete="street-address" /></label>
        <button className="button primary" type="submit">Continue <span>-&gt;</span></button>
      </form>
    </section> : complete && showResults ? <ChecklistResults items={result.items} notes={result.notes} answers={answers} projectName={projectName} projectLocation={projectLocation} onRestart={restart} onEdit={() => { setShowResults(false); setIndex(0) }} /> : <>
      <ProgressBar questionNumber={index + 1} answered={Object.keys(answers).length} possibleTotal={questions.length} />
      <div className="status"><span><strong>{Object.keys(answers).length}</strong> Answers recorded</span><span><strong>{result.items.length}</strong> Preliminary action items</span></div>
      {question && <QuestionCard question={question} value={answers[question.id]} onChange={update} />}
      <nav className="navigation"><button className="button secondary" disabled={index === 0} onClick={() => setIndex(Math.max(0, index - 1))}>&lt;- Back</button><button className="button primary" disabled={!question || !answers[question.id]} onClick={next}>{index === applicable.length - 1 ? 'Review Checklist' : 'Next'} <span>-&gt;</span></button></nav>
    </>}
  </main>
}
