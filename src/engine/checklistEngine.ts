import { checklistItems, questions } from '../data/checklistRules'
import type { AnswerMap, ChecklistItem, Question } from '../types/checklist'

export const getQuestion = (id: string) => questions.find((question) => question.id === id)
export function getApplicableQuestions(answers: AnswerMap): Question[] {
  const path: Question[] = []
  let id: string | undefined = questions[0]?.id
  const seen = new Set<string>()
  while (id && !seen.has(id)) { const question = getQuestion(id); if (!question) break; path.push(question); seen.add(id); const value = answers[id]; id = value ? question.options.find((option) => option.value === value)?.nextQuestion : undefined }
  return path
}
export function sanitizeAnswers(answers: AnswerMap): AnswerMap { const allowed = new Set(getApplicableQuestions(answers).map((q) => q.id)); return Object.fromEntries(Object.entries(answers).filter(([id]) => allowed.has(id))) }
export function generateChecklist(answers: AnswerMap): { items: ChecklistItem[]; notes: string[] } {
  const keys = new Set<string>(); const notes: string[] = []
  getApplicableQuestions(answers).forEach((question) => { const choice = question.options.find((option) => option.value === answers[question.id]); choice?.addItems?.forEach((item) => keys.add(item)); choice?.notes?.forEach((note) => notes.push(note)) })
  return { items: [...keys].map((key) => checklistItems[key]).filter(Boolean), notes: [...new Set(notes)] }
}
export function isComplete(answers: AnswerMap) { const path = getApplicableQuestions(answers); const last = path[path.length - 1]; return path.length > 0 && path.every((question) => Boolean(answers[question.id])) && !last?.options.find((option) => option.value === answers[last.id])?.nextQuestion }
