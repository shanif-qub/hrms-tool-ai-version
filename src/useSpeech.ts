import { useCallback, useRef, useState } from 'react';

/** Minimal Web Speech API wrapper. Streams interim + final transcripts to onResult,
 *  and reports a human-readable reason to onError when it can't run.
 *  Web Speech requires a SECURE CONTEXT (https:// or http://localhost) and mic permission. */
export function useSpeech(
  onResult: (text: string, final: boolean) => void,
  onError?: (message: string) => void,
) {
  const supported = typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  const stop = useCallback(() => { try { recRef.current?.stop?.(); } catch { /* ignore */ } setListening(false); }, []);

  const start = useCallback(() => {
    if (!supported) { onError?.('Voice input isn’t supported in this browser — try Chrome, Edge or Safari.'); return; }
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      onError?.('Voice needs a secure connection — open the app over https or on localhost.');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let rec: any;
    try { rec = new SR(); } catch { onError?.('Couldn’t start voice input.'); return; }
    recRef.current = rec;
    rec.lang = 'en-IN';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    let finalText = '';
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interim += t;
      }
      onResult((finalText + interim).trim(), !!finalText && !interim);
    };
    rec.onerror = (e: any) => {
      setListening(false);
      const code = e?.error;
      const msg =
        code === 'not-allowed' || code === 'service-not-allowed' ? 'Microphone is blocked — allow mic access from the address-bar icon, then try again.'
        : code === 'audio-capture' ? 'No microphone found.'
        : code === 'no-speech' ? 'Didn’t catch that — try speaking again.'
        : code === 'network' ? 'Voice service is unreachable — check your connection.'
        : code === 'aborted' ? ''
        : 'Voice input failed — please try again.';
      if (msg) onError?.(msg);
    };
    rec.onend = () => setListening(false);

    setListening(true);
    try { rec.start(); } catch { setListening(false); onError?.('Voice is already listening or unavailable.'); }
  }, [supported, onResult, onError]);

  const toggle = useCallback(() => { if (listening) stop(); else start(); }, [listening, start, stop]);

  return { listening, supported, start, stop, toggle };
}
