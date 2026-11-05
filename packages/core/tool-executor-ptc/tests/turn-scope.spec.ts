/**
 * Writer-side turn scope for the PTC dispatch records, exercised through
 * `Session.append` without any executor.
 *
 * The regression lives in this package because the guarded event types are
 * declared here; `@deepseek-ai/dsh-session` tests cannot name them without a
 * dependency cycle.
 */

import { describe, expect, it } from 'vitest'
import { createUserMessage, ToolCallId } from '@deepseek-ai/dsh-llm'
import { Session, SessionId, SessionTurnScopeError } from '@deepseek-ai/dsh-session'
import type {} from '../src/types.ts'

function dispatchStart() {
  return {
    rootCallId: ToolCallId('root'),
    parentCallId: ToolCallId('root'),
    subCallId: ToolCallId('root:ptc:1'),
    name: 'echo',
    arguments: { value: 'x' },
  }
}

function replay(session: Session): Session {
  return Session.create(session.id, structuredClone([...session.snapshotEvents()]), session.header)
}

describe('Session turn scope for PTC dispatch records', () => {
  it('rejects a dispatch start after the turn closed and leaves the log readable', () => {
    const session = Session.create(SessionId('turn-scope-closed'))
    session.append('turn/start', { turn: 1 })
    session.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
    const committedSeq = session.seq

    expect(() => session.append('tool/ptc-dispatch-start', dispatchStart())).toThrow(SessionTurnScopeError)
    expect(() => session.append('tool/ptc-dispatch-start', dispatchStart()))
      .toThrow('"tool/ptc-dispatch-start" is outside an open turn')

    // The rejected append never entered the log, so the stored session remains
    // loadable and derives the same history.
    expect(session.seq).toBe(committedSeq)
    const restored = replay(session)
    expect(restored.snapshotEvents().slice(0, -1)).toEqual(session.snapshotEvents())
    expect(restored.deriveMessages()).toEqual(session.deriveMessages())
  })

  it('rejects a dispatch settle after the turn closed', () => {
    const session = Session.create(SessionId('turn-scope-settle'))
    session.append('turn/start', { turn: 1 })
    session.append('tool/ptc-dispatch-start', dispatchStart())
    session.append('turn/end', { turn: 1, reason: { kind: 'aborted', reason: { kind: 'user' } } })

    expect(() => session.append('tool/ptc-dispatch', {
      ...dispatchStart(),
      isError: false,
      content: [{ type: 'text', text: 'ok' }],
    })).toThrow('"tool/ptc-dispatch" is outside an open turn')
    expect(session.snapshotEvents().filter(event => event.type === 'tool/ptc-dispatch')).toHaveLength(0)
  })

  it('accepts a dispatch start and settle inside the open turn', () => {
    const session = Session.create(SessionId('turn-scope-open'))
    session.append('turn/start', { turn: 1 })
    session.append('tool/ptc-dispatch-start', dispatchStart())
    session.append('tool/ptc-dispatch', {
      ...dispatchStart(),
      isError: false,
      content: [{ type: 'text', text: 'ok' }],
    })
    session.append('turn/end', { turn: 1, reason: { kind: 'completed' } })

    expect(session.snapshotEvents().map(event => event.type)).toEqual([
      'turn/start', 'tool/ptc-dispatch-start', 'tool/ptc-dispatch', 'turn/end',
    ])
    const restored = replay(session)
    expect(restored.snapshotEvents().slice(0, -1)).toEqual(session.snapshotEvents())
  })

  it('still accepts events the reader allows outside a turn', () => {
    const session = Session.create(SessionId('turn-scope-unscoped'))
    session.append('user/message', createUserMessage({
      content: [{ type: 'text', text: 'before any turn' }], source: { kind: 'user' },
    }), { surfaceOp: 'append' })
    session.append('turn/start', { turn: 1 })
    session.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
    // Opening the next turn and log-only records stay legal outside a turn.
    session.append('turn/start', { turn: 2 })
    session.append('session/end-seed', {})

    expect(session.snapshotEvents().map(event => event.type)).toEqual([
      'user/message', 'turn/start', 'turn/end', 'turn/start', 'session/end-seed',
    ])
  })

  it('retains an open turn from a restored partial tail', () => {
    const live = Session.create(SessionId('turn-scope-partial'))
    live.append('turn/start', { turn: 1 })
    live.append('tool/ptc-dispatch-start', dispatchStart())

    const restored = replay(live)
    // The stored tail still sits inside turn 1, so a resumed session may log
    // its remaining turn-scoped records.
    expect(() => restored.append('tool/ptc-dispatch', {
      ...dispatchStart(),
      isError: false,
      content: [{ type: 'text', text: 'ok' }],
    })).not.toThrow()
  })
})
