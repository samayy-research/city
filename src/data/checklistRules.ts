import type { ChecklistItem, CoordinationRoute, Question } from '../types/checklist'

/* COJ-informed screening rules. The result is preliminary and must be reviewed
   with the Permit Coordinator and relevant City staff before final routing. */
const source = 'COJ IMPACT — Application Routing Questionnaire'
const item = (id: string, label: string, category: ChecklistItem['category'], outcome: ChecklistItem['outcome'], reason: string, sourceLocation = 'Routing questionnaire'): ChecklistItem => ({ id, label, category, outcome, reason, source, sourceLocation })

export const checklistItems: Record<string, ChecklistItem> = {
  projectSummary: item('projectSummary', 'Prepare a concise description of the proposed work and intended use', 'Project record', 'preparation', 'A complete project description supports preliminary routing.'),
  address: item('address', 'Verify project address, parcel, and suite or unit number', 'Project record', 'preparation', 'Location information is needed for City review.'),
  existing: item('existing', 'Document existing conditions and prior approved use', 'Project record', 'preparation', 'Existing conditions may affect review routing.'),
  cou: item('cou', 'Include Certificate of Use (COU) in the preliminary permit matrix', 'Zoning & use', 'preliminary-route', 'A change in business use was identified.', 'COJ rules table: change in business use'),
  convertingUse: item('convertingUse', 'Include Change of Use Building Permit in the preliminary permit matrix', 'Permit routing', 'preliminary-route', 'A change in occupancy classification was identified.', 'COJ rules table: occupancy classification change'),
  buildingPermit: item('buildingPermit', 'Include Building Permit in the preliminary permit matrix', 'Permit routing', 'preliminary-route', 'Interior construction or alterations were identified.', 'COJ rules table: interior construction'),
  plumbingPermit: item('plumbingPermit', 'Include Plumbing Permit in the preliminary permit matrix', 'Permit routing', 'preliminary-route', 'New or modified plumbing work was identified.', 'COJ rules table: new plumbing'),
  sitePermit: item('sitePermit', 'Include Civil review / Site-Work Permit in the preliminary permit matrix', 'Permit routing', 'preliminary-route', 'Site work was identified.', 'COJ rules table: site work'),
  rowPermit: item('rowPermit', 'Include Right-of-Way Permit in the preliminary permit matrix', 'Permit routing', 'preliminary-route', 'Work in the public right-of-way was identified.', 'COJ rules table: City right-of-way work'),
  occupancyReview: item('occupancyReview', 'Confirm occupancy classification with Building and Fire reviewers', 'Zoning & use', 'review-flag', 'Occupancy classification needs City confirmation.'),
  mechanicalReview: item('mechanicalReview', 'Confirm mechanical/HVAC review and permit requirements', 'Permit routing', 'review-flag', 'Mechanical work was identified; the routing table does not confirm a universal permit outcome.'),
  electricalReview: item('electricalReview', 'Confirm electrical review and permit requirements', 'Permit routing', 'review-flag', 'Electrical work was identified; the routing table does not confirm a universal permit outcome.'),
  fireReview: item('fireReview', 'Confirm Fire Prevention review requirements', 'Permit routing', 'review-flag', 'Fire protection or special conditions were identified.'),
  signReview: item('signReview', 'Confirm sign review and permit requirements', 'Permit routing', 'review-flag', 'New or modified signage was identified.'),
  zoningReview: item('zoningReview', 'Confirm zoning and land-use review requirements', 'Zoning & use', 'review-flag', 'Zoning, land-use, or location details need City confirmation.'),
  riskCoordination: item('riskCoordination', 'Request early coordination on known project risks', 'Coordination', 'review-flag', 'Potential zoning, parking, drainage, utility, historic, environmental, or code risks were identified.'),
  priorApplicationReview: item('priorApplicationReview', 'Provide prior application, review, denial, or withdrawal information to the reviewer', 'Coordination', 'review-flag', 'A previous City submission was identified.'),
  coordinatorValidation: item('coordinatorValidation', 'Review the preliminary permit matrix with the COJ Permit Coordinator', 'Coordination', 'review-flag', 'The source workflow requires City staff to determine final required permits.'),
  planSet: item('planSet', 'Prepare applicable site, architectural, structural, and MEP plan documents', 'Document preparation', 'preparation', 'Commercial plan-review material identifies these as applicable submittal-package documents.', 'BID Commercial Plan Review checklist'),
  codeSummary: item('codeSummary', 'Prepare applicable code summary and life-safety information', 'Document preparation', 'preparation', 'Commercial plan-review material identifies these as applicable submittal-package documents.', 'BID Commercial Plan Review checklist'),
  ownerPermission: item('ownerPermission', 'Prepare owner permission documentation, if applicable', 'Document preparation', 'preparation', 'Commercial plan-review material identifies owner permission as an applicable document.', 'BID Commercial Plan Review checklist'),
  assistedLiving: item('assistedLiving', 'Use the separate Assisted Living Facility licensing checklist', 'Specialized review', 'specialized', 'This is an Assisted Living Facility use case and requires a separate licensing workflow.', 'Checklist_Recommended_Assisted_Living_Facility_April2022'),
  civilAcceptance: item('civilAcceptance', 'Review the separate civil-plan / acceptance and approval checklist', 'Specialized review', 'specialized', 'Civil acceptance or approval work was identified.', 'DSD-AAC Acceptance-or-Approval Checklist Form')
}

export const coordinationRoutes: Record<string, CoordinationRoute> = {
  new: { projectType: 'new', label: 'New construction', team: 'Building Inspection Division and Development Services', description: 'Start with the relevant City teams below to coordinate building review, site work, utilities, access, and sequencing.' },
  addition: { projectType: 'addition', label: 'Addition or expansion', team: 'Building Inspection Division and Development Services', description: 'Start with the relevant City teams below to coordinate the existing building, addition, and any site impacts.' },
  renovation: { projectType: 'renovation', label: 'Renovation or tenant build-out', team: 'Building Inspection Division', description: 'Start with the relevant City teams below to discuss existing conditions, intended use, life safety, and trade-permit scope.' },
  changeUse: { projectType: 'changeUse', label: 'Change of use or occupancy', team: 'Zoning and Building Inspection Division', description: 'Start with the relevant City teams below to confirm the proposed use, occupancy, Certificate of Use, and required building review.' },
  siteOnly: { projectType: 'siteOnly', label: 'Site improvement only', team: 'Development Services Division', description: 'Start with the relevant City teams below to discuss civil review, access, drainage, utilities, landscaping, and right-of-way needs.' }
}

const yesNo = (yesItems: string[], nextQuestion?: string): Question['options'] => [{ label: 'Yes', value: 'yes', addItems: yesItems, nextQuestion }, { label: 'No', value: 'no', nextQuestion }, { label: 'Unsure', value: 'unsure', addItems: ['coordinatorValidation'], nextQuestion }]

export const questions: Question[] = [
  { id: 'projectType', label: 'What is the primary project type?', helper: 'This screening tool supports preliminary commercial permit-intake conversations; it does not make a final City determination.', options: [
    { label: 'New construction', value: 'new', addItems: ['projectSummary', 'address', 'coordinatorValidation'], nextQuestion: 'businessUseChange' },
    { label: 'Addition or expansion', value: 'addition', addItems: ['projectSummary', 'address', 'existing', 'coordinatorValidation'], nextQuestion: 'businessUseChange' },
    { label: 'Renovation or tenant build-out', value: 'renovation', addItems: ['projectSummary', 'address', 'existing', 'coordinatorValidation'], nextQuestion: 'businessUseChange' },
    { label: 'Change of business use or occupancy', value: 'changeUse', addItems: ['projectSummary', 'address', 'existing', 'coordinatorValidation'], nextQuestion: 'businessUseChange' },
    { label: 'Site improvement only', value: 'siteOnly', addItems: ['projectSummary', 'address', 'coordinatorValidation'], nextQuestion: 'siteImpacts' }
  ] },
  { id: 'businessUseChange', label: 'Will the business use change, expand, relocate, or add another use?', helper: 'A yes response adds a COU to the preliminary permit matrix; City staff make the final determination.', options: yesNo(['cou'], 'occupancyChange') },
  { id: 'occupancyChange', label: 'Will the occupancy classification change?', helper: 'If you are unsure, select Unsure so the result flags it for City confirmation.', options: yesNo(['convertingUse', 'occupancyReview'], 'interiorConstruction') },
  { id: 'interiorConstruction', label: 'Will the project include interior construction or alterations?', helper: 'Examples include tenant build-out, partitions, exits, accessibility upgrades, or life-safety work.', options: yesNo(['buildingPermit'], 'mechanicalChanges') },
  { id: 'mechanicalChanges', label: 'Are mechanical or HVAC systems being changed?', options: yesNo(['mechanicalReview'], 'electricalChanges') },
  { id: 'electricalChanges', label: 'Are electrical systems being changed?', options: yesNo(['electricalReview'], 'plumbingChanges') },
  { id: 'plumbingChanges', label: 'Is new or modified plumbing work proposed?', options: yesNo(['plumbingPermit'], 'fireConditions') },
  { id: 'fireConditions', label: 'Will the project include fire-protection systems, commercial cooking, hazardous materials, or special occupancy conditions?', options: yesNo(['fireReview'], 'signWork') },
  { id: 'signWork', label: 'Will there be a new or modified sign?', options: yesNo(['signReview'], 'siteImpacts') },
  { id: 'siteImpacts', label: 'Will work affect parking, access, drainage, utilities, landscaping, sidewalks, or driveways?', options: yesNo(['sitePermit'], 'rightOfWay') },
  { id: 'rightOfWay', label: 'Will work occur in the public right-of-way?', options: yesNo(['rowPermit'], 'knownIssues') },
  { id: 'knownIssues', label: 'Are there known zoning, setback, parking, accessibility, utility, drainage, historic, environmental, or code-compliance issues?', options: yesNo(['riskCoordination', 'zoningReview'], 'previousSubmission') },
  { id: 'previousSubmission', label: 'Has this project previously been submitted, reviewed, denied, or withdrawn?', options: yesNo(['priorApplicationReview'], 'commercialPlanReview') },
  { id: 'commercialPlanReview', label: 'Will this project proceed through commercial building-plan review?', helper: 'If yes or unsure, include the listed documents as preliminary preparation items for coordinator review.', options: [
    { label: 'Yes', value: 'yes', addItems: ['ownerPermission', 'planSet', 'codeSummary'], nextQuestion: 'assistedLivingFacility' },
    { label: 'No', value: 'no', nextQuestion: 'assistedLivingFacility' },
    { label: 'Unsure', value: 'unsure', addItems: ['ownerPermission', 'planSet', 'codeSummary', 'coordinatorValidation'], nextQuestion: 'assistedLivingFacility' }
  ] },
  { id: 'assistedLivingFacility', label: 'Is the intended use an Assisted Living Facility?', helper: 'This activates a separate state licensing checklist; it is not a general COJ construction requirement.', options: yesNo(['assistedLiving'], 'civilAcceptance') },
  { id: 'civilAcceptance', label: 'Does the project involve civil-plan, plat, subdivision, or acceptance/approval work?', helper: 'This activates a separate downstream civil acceptance checklist.', options: yesNo(['civilAcceptance'], undefined) }
]
