import type { ChecklistItem } from '../types/checklist'

export function ChecklistSection({ title, items, completed, onToggle }: { title: string; items: ChecklistItem[]; completed: Set<string>; onToggle: (id: string) => void }) {
  return <section className="checklist-section"><h3>{title}</h3>{items.map((item) => <label className={`check-item ${completed.has(item.id) ? 'done' : ''}`} key={item.id}>
    <input type="checkbox" checked={completed.has(item.id)} onChange={() => onToggle(item.id)} />
    <span className="box">✓</span>
    <span className="item-copy"><strong>{item.label}</strong><span className="item-reason">Why this appears: {item.reason}</span><span className="item-source">Source: {item.source}{item.sourceLocation ? ` · ${item.sourceLocation}` : ''}</span></span>
  </label>)}</section>
}
