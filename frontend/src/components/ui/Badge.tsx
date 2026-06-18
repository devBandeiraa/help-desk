import { Flame } from 'lucide-react'
import type { Priority, TicketStatus } from '../../types'
import {
  PRIORITY_CLASS,
  PRIORITY_LABEL,
  STATUS_CLASS,
  STATUS_LABEL,
} from '../../lib/constants'

const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium'

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`${base} ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`${base} ${PRIORITY_CLASS[priority]}`}>
      {priority === 'CRITICAL' && <Flame className="h-3 w-3" />}
      {PRIORITY_LABEL[priority]}
    </span>
  )
}
