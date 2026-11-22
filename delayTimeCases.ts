// Plain Web Audio code, so the same file runs on react-native-audio-api and in a browser.
// Each case renders a one-sample click through a DelayNode (maxDelayTime 1 s) and reports when the click comes out.

const SAMPLE_RATE = 48000;

type Ctor = new (options: { numberOfChannels: number; length: number; sampleRate: number }) => any;

const CASES = [
  { name: 'delayTime.value = 0.25, nothing connected', value: 0.25, signal: 0, expected: 0.25 },
  { name: 'delayTime.value = 0, signal 0.25 connected', value: 0, signal: 0.25, expected: 0.25 },
  { name: 'delayTime.value = 0.25, signal 0.25 connected', value: 0.25, signal: 0.25, expected: 0.5 },
  { name: 'delayTime.value = 0, nothing connected', value: 0, signal: 0, expected: 0 },
];

async function clickArrival(OfflineCtx: Ctor, value: number, signal: number) {
  const ctx = new OfflineCtx({ numberOfChannels: 1, length: SAMPLE_RATE * 2, sampleRate: SAMPLE_RATE });
  const click = ctx.createBuffer(1, 128, SAMPLE_RATE);
  click.getChannelData(0)[0] = 1;
  const source = ctx.createBufferSource();
  source.buffer = click;
  const delay = ctx.createDelay(1);
  delay.delayTime.value = value;
  source.connect(delay);
  delay.connect(ctx.destination);
  if (signal !== 0) {
    const control = ctx.createConstantSource();
    control.offset.value = signal;
    control.connect(delay.delayTime);
    control.start(0);
  }
  source.start(0);
  const rendered = await ctx.startRendering();
  const out: Float32Array = rendered.getChannelData(0);
  for (let i = 0; i < out.length; i++) if (Math.abs(out[i]) > 0.5) return i / SAMPLE_RATE;
  return null;
}

export async function runCases(OfflineCtx: Ctor, log: (line: string) => void) {
  for (const c of CASES) {
    const got = await clickArrival(OfflineCtx, c.value, c.signal);
    const ok = got !== null && Math.abs(got - c.expected) < 0.005;
    log(`${ok ? 'OK  ' : 'BAD '} ${c.name}: expected ${c.expected.toFixed(3)} s, got ${got === null ? 'no output' : `${got.toFixed(3)} s`}`);
  }
  log('done');
}
