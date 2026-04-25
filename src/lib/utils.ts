import { formatDistanceToNow, format } from 'date-fns'
import type { Priority } from '@/types'

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: string): string {
  return format(new Date(date), 'MMM d')
}

export function formatRelative(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDateTime(date: string): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function priorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    low: 'border-emerald-600 text-emerald-400 bg-emerald-400/10',
    medium: 'border-amber-600 text-amber-400 bg-amber-400/10',
    high: 'border-red-600 text-red-400 bg-red-400/10',
  }
  return colors[priority]
}

export function priorityDot(priority: Priority): string {
  const colors: Record<Priority, string> = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500',
  }
  return colors[priority]
}

export function getBoardUrl(boardId: string): string {
  return `${window.location.origin}/board/${boardId}`
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator?.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  return Promise.reject(new Error('Clipboard API not available'))
}
