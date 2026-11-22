import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { OfflineAudioContext } from 'react-native-audio-api';
import { runCases } from './delayTimeCases';

const lines: string[] = [];
const listeners = new Set<() => void>();

function log(line: string) {
  console.log(`[repro] ${line}`);
  lines.push(line);
  listeners.forEach((l) => l());
}

let started = false;

export default function App() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    if (!started) {
      started = true;
      runCases(OfflineAudioContext as never, log).catch((e) => log(`error: ${e}`));
    }
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
      {lines.map((line, i) => (
        <Text key={i} style={{ fontSize: 15, fontFamily: 'monospace', marginBottom: 8 }}>
          {line}
        </Text>
      ))}
    </ScrollView>
  );
}
