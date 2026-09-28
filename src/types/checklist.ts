export type AnswerMap = Record<string, string>
export type Category = 'Project record' | 'Zoning & use' | 'Permit routing' | 'Document preparation' | 'Site & civil' | 'Coordination' | 'Specialized review'
export type Outcome = 'preliminary-route' | 'review-flag' | 'preparation' | 'specialized'

export interface ChecklistItem {
  id: string
  label: string
  category: Category
  outcome: Outcome
  reason: string
  source: string
  sourceLocation?: string
}
export interface CoordinationRoute {
  projectType: string
  label: string
  team: string
  meetingContact: string
  meetingLocation: string
  description: string
}
export interface RuleOption { label: string; value: string; nextQuestion?: string; addItems?: string[]; notes?: string[] }
export interface Question { id: string; label: string; helper?: string; options: RuleOption[] }
