// telemetry — Phase B. A single, honest emit point for interaction events.
// Every action already flows through the store reducer; we tap that one choke-point
// so a real deployment can answer "how many users ever Peel / Combine / build in
// Canvas" with a one-line change. NOTHING is sent anywhere here: there is no
// analytics backend in this build, and faking a dashboard would be dishonest.
// Events are buffered in memory (and optionally mirrored to the console in dev)
// so the wiring is demonstrable and inspectable without pretending it reports.

export interface InteractionEvent {
  interaction: string;   // the action type, e.g. 'peel', 'vibeCreate', 'boardAdd'
  surface: string;       // lens:region at the time, e.g. 'manager:team'
  at: number;            // epoch ms
}

// The set of interactions the review specifically wants to measure adoption of.
// Tagging them lets a real funnel query filter to "grammar" gestures cheaply.
export const GRAMMAR_INTERACTIONS = new Set([
  'peel', 'combine', 'stack', 'boardAdd', 'boardRemove', 'vibeCreate', 'vibeWidgets',
  'publishTool', 'toggleSelect', 'setHomeView', 'explainToken',
]);

const buffer: InteractionEvent[] = [];
const MAX = 500;
type Sink = (e: InteractionEvent) => void;
let sink: Sink | null = null;

/** A real deployment calls this once with its analytics client. Until then, undefined. */
export function connectTelemetry(fn: Sink) { sink = fn; }

export function emit(interaction: string, surface: string) {
  const e: InteractionEvent = { interaction, surface, at: Date.now() };
  buffer.push(e);
  if (buffer.length > MAX) buffer.shift();
  // Dev-only mirror so the wiring is visible; guarded so it's silent in prod builds.
  if (typeof import.meta !== 'undefined' && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[telemetry:not-connected]', interaction, surface);
  }
  sink?.(e);   // no-op until connectTelemetry() is wired to a real service
}

/** Inspectable in dev; a session-local view only, never persisted or transmitted. */
export function telemetrySnapshot(): InteractionEvent[] { return [...buffer]; }
