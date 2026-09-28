export function ProgressBar({ questionNumber, answered, possibleTotal }: { questionNumber: number; answered: number; possibleTotal: number }) {
  const percent = possibleTotal ? Math.min(100, (answered / possibleTotal) * 100) : 0
  return <section className="progress" aria-label={`Question ${questionNumber}; ${answered} answers recorded`}>
    <div className="progress-copy"><span>Question {questionNumber}</span><span>{answered} of up to {possibleTotal} answers recorded</span></div>
    <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
  </section>
}
