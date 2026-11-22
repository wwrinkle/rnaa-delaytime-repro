# react-native-audio-api: `DelayNode.delayTime` ignores connected signals

Minimal reproduction for two `DelayNode` bugs in react-native-audio-api 1.0.1:

1. A signal connected to `delayTime` has no effect.
2. With `delayTime` at 0, the node delays by `maxDelayTime` instead of 0.

[delayTimeCases.ts](delayTimeCases.ts) is plain Web Audio code. It renders a one-sample click through a `DelayNode`
(`maxDelayTime` 1 s) in an `OfflineAudioContext` and reports when the click comes out.

## Run

```sh
npm install
npx expo prebuild --platform android
npx expo run:android --variant release
```

Results are shown on screen and logged with a `[repro]` prefix:

```sh
adb logcat ReactNativeJS:V '*:S' | grep '\[repro\]'
```

## Result

Pixel 10, Android 17, release build, Hermes. Two runs, each in a fresh app process, gave the same output:

```
OK   delayTime.value = 0.25, nothing connected: expected 0.250 s, got 0.250 s
BAD  delayTime.value = 0, signal 0.25 connected: expected 0.250 s, got 1.000 s
BAD  delayTime.value = 0.25, signal 0.25 connected: expected 0.500 s, got 0.250 s
BAD  delayTime.value = 0, nothing connected: expected 0.000 s, got 1.000 s
```

The same file in Chrome:

```
OK   delayTime.value = 0.25, nothing connected: expected 0.250 s, got 0.250 s
OK   delayTime.value = 0, signal 0.25 connected: expected 0.250 s, got 0.250 s
OK   delayTime.value = 0.25, signal 0.25 connected: expected 0.500 s, got 0.500 s
OK   delayTime.value = 0, nothing connected: expected 0.000 s, got 0.000 s
```
