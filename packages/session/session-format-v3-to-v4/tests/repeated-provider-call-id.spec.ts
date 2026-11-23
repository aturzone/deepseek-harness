import { describe, expect, it } from 'vitest'
import { Session, type SessionId, SessionLogOffset, type SessionEvent, type SessionHeader } from '@deepseek-ai/dsh-session'
import { sessionFormatCatalog } from '@deepseek-ai/dsh-session-format-catalog'
import type { SessionFormatEvent } from '@deepseek-ai/dsh-session-format'
import { brandString } from '@deepseek-ai/dsh-brand'

type Row = { type: string; data: Record<string, unknown>; surfaceOp?: unknown; sourceEventSeqs?: number[]; ignorable?: true }
const row = (type: string, data: Record<string, unknown>): Row => ({ type, data })
const user = (): Row => ({
  ...row('user/message', { id: 'input', role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text: 'input' }] }),
  surfaceOp: 'append',
})

/** Byte-identical provider tool call repeated across turns (content-derived provider id). */
const REPEATED = 'call_0_ec83e83a03dfdff8'
const step = (turn: number): { turn: number; step: number } => ({ turn, step: 1 })
const assistant = (turn: number, callId = REPEATED): Row => ({
  ...row('assistant/message', {
    ...step(turn),
    stream: [],
    message: {
      id: `assistant-${turn}`,
      role: 'assistant',
      source: { kind: 'model', provider: 'mock', model: 'mock' },
      content: [{ type: 'tool-call', id: callId, name: 'run_code', arguments: '{"code":"await tools.read({})"}' }],
    },
  }),
  surfaceOp: 'append',
})
const call = (turn: number): Row => row('tool/call', { ...step(turn), callId: REPEATED, name: 'run_code', arguments: '{"code":"await tools.read({})"}' })
const result = (turn: number): Row => ({
  ...row('tool/result', {
    ...step(turn),
    message: {
      id: `result-${turn}`,
      role: 'tool',
      source: { kind: 'tool', callId: REPEATED },
      toolCallId: REPEATED,
      content: [{ type: 'text', text: 'done' }],
    },
  }),
  surfaceOp: 'append',
})
const dispatch = (type: 'start' | 'end', subCallId = `${REPEATED}:ptc:1`): Row => row(
  type === 'start' ? 'tool/ptc-dispatch-start' : 'tool/ptc-dispatch',
  {
    rootCallId: REPEATED,
    parentCallId: REPEATED,
    subCallId,
    name: 'read',
    arguments: { path: 'a' },
    ...type === 'end' ? { isError: false, content: [{ type: 'text', text: 'done' }] } : {},
  },
)

/** One complete ordinary turn around the same provider call id. */
const turn = (n: number, withDispatch: boolean): Row[] => [
  row('turn/start', { turn: n }),
  row('step/start', step(n)),
  user(),
  assistant(n),
  call(n),
  ...withDispatch ? [dispatch('start'), dispatch('end')] : [],
  result(n),
  row('step/end', step(n)),
  row('turn/end', { turn: n, reason: { kind: 'completed' } }),
]

/** Exercise physical JSON, catalog relationship admission, and Session adoption together. */
function reopen(rows: readonly Row[]): Session {
  const restore = sessionFormatCatalog.createRestore(
    { type: 'session', version: 4, id: 'repeated-call-id', createdAt: 1, delegationDepth: 0, isSeeded: false },
    { recovery: 'strict', validation: 'current' },
  )
  for (const [seq, candidate] of rows.entries()) {
    const event = { ...candidate, seq, time: seq + 1 } as unknown as SessionFormatEvent
    restore.decodeRow(JSON.parse(JSON.stringify(sessionFormatCatalog.encodeCurrentEvent(event))))
  }
  const artifact = restore.finish()
  return Session.fromRestore(
    brandString<SessionId>(artifact.header.id),
    artifact.events as SessionEvent[],
    artifact.header as unknown as SessionHeader,
    SessionLogOffset(artifact.inheritedEventCount),
    'detached',
  )
}

describe('repeated provider tool-call id across turns', () => {
  it('accepts the repeated advertised id when no PTC sub-calls were dispatched', () => {
    expect(() => reopen([...turn(1, false), ...turn(2, false)])).not.toThrow()
  })

  it('accepts the repeated id with PTC dispatches that reuse the derived subCallId', () => {
    expect(() => reopen([...turn(1, true), ...turn(2, true)])).not.toThrow()
  })

  it('still rejects a repeated subCallId that starts twice before settling', () => {
    const rows = [...turn(1, false)]
    rows.splice(6, 0, dispatch('start'), dispatch('start'))
    expect(() => reopen(rows)).toThrow(/repeats subCallId/)
  })
})
