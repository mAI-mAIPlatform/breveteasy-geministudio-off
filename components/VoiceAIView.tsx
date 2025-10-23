import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { ai } from '../services/geminiService';
import { useLocalization } from '../hooks/useLocalization';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

type ConversationStatus = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';
type TranscriptEntry = { role: 'user' | 'model'; text: string; };

const StatusIndicator: React.FC<{ status: ConversationStatus }> = ({ status }) => {
    const getStatusInfo = () => {
        switch (status) {
            case 'listening': return { text: "J'écoute...", color: 'bg-green-500', pulse: true };
            case 'speaking': return { text: "Je parle...", color: 'bg-sky-500', pulse: true };
            case 'connecting': return { text: "Connexion...", color: 'bg-yellow-500', pulse: true };
            case 'error': return { text: "Erreur", color: 'bg-red-500', pulse: false };
            default: return { text: "Inactif", color: 'bg-slate-500', pulse: false };
        }
    };

    const { text, color, pulse } = getStatusInfo();

    return (
        <div className="flex items-center justify-center gap-3">
            <div className={`relative w-4 h-4 rounded-full ${color}`}>
                {pulse && <div className={`absolute inset-0 rounded-full ${color} animate-ping`}></div>}
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{text}</span>
        </div>
    );
};

export const VoiceAIView: React.FC = () => {
    const { t } = useLocalization();
    const [status, setStatus] = useState<ConversationStatus>('idle');
    const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioInfrastructureRef = useRef<{
        stream: MediaStream;
        inputAudioContext: AudioContext;
        outputAudioContext: AudioContext;
        scriptProcessor: ScriptProcessorNode;
        sources: Set<AudioBufferSourceNode>;
        nextStartTime: number;
    } | null>(null);
    const transcriptContainerRef = useRef<HTMLDivElement>(null);
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    useEffect(() => {
        if (transcriptContainerRef.current) {
            transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
        }
    }, [transcripts]);
  
    const stopConversation = useCallback(async () => {
        setStatus('idle');
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) { console.error("Error closing session:", e); }
            sessionPromiseRef.current = null;
        }

        if (audioInfrastructureRef.current) {
            audioInfrastructureRef.current.stream.getTracks().forEach(track => track.stop());
            audioInfrastructureRef.current.scriptProcessor.disconnect();
            audioInfrastructureRef.current.inputAudioContext.close().catch(console.error);
            audioInfrastructureRef.current.outputAudioContext.close().catch(console.error);
            audioInfrastructureRef.current = null;
        }
    }, []);

    useEffect(() => { return () => { stopConversation(); }; }, [stopConversation]);
  
    const startConversation = async () => {
        setError(null);
        setStatus('connecting');
        setTranscripts([]);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            const sources = new Set<AudioBufferSourceNode>();
            
            audioInfrastructureRef.current = { stream, inputAudioContext, outputAudioContext, scriptProcessor, sources, nextStartTime: 0 };

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('listening');
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const { text } = message.serverContent.inputTranscription;
                            currentInputTranscriptionRef.current += text;
                            setTranscripts(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.role === 'user') {
                                    return [...prev.slice(0, -1), { role: 'user', text: currentInputTranscriptionRef.current }];
                                }
                                return [...prev, { role: 'user', text: currentInputTranscriptionRef.current }];
                            });
                        }
                        if (message.serverContent?.outputTranscription) {
                             setStatus('speaking');
                            const { text } = message.serverContent.outputTranscription;
                            currentOutputTranscriptionRef.current += text;
                             setTranscripts(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.role === 'model') {
                                    return [...prev.slice(0, -1), { role: 'model', text: currentOutputTranscriptionRef.current }];
                                }
                                return [...prev, { role: 'model', text: currentOutputTranscriptionRef.current }];
                            });
                        }

                        if (message.serverContent?.turnComplete) {
                            setStatus('listening');
                             currentInputTranscriptionRef.current = '';
                             currentOutputTranscriptionRef.current = '';
                        }

                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData) {
                             const audio = audioInfrastructureRef.current;
                             if (!audio) return;
                             
                             audio.nextStartTime = Math.max(audio.nextStartTime, audio.outputAudioContext.currentTime);
                             const audioBuffer = await decodeAudioData(decode(audioData), audio.outputAudioContext, 24000, 1);
                             const source = audio.outputAudioContext.createBufferSource();
                             source.buffer = audioBuffer;
                             source.connect(audio.outputAudioContext.destination);
                             source.addEventListener('ended', () => audio.sources.delete(source));
                             source.start(audio.nextStartTime);
                             audio.nextStartTime += audioBuffer.duration;
                             audio.sources.add(source);
                        }
                        
                         if (message.serverContent?.interrupted) {
                            audioInfrastructureRef.current?.sources.forEach(s => s.stop());
                            audioInfrastructureRef.current?.sources.clear();
                            if(audioInfrastructureRef.current) audioInfrastructureRef.current.nextStartTime = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setError("Une erreur de connexion est survenue.");
                        stopConversation();
                    },
                    onclose: () => { setStatus('idle'); }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: "You are VocalAI, a friendly and helpful voice assistant for the Brevet' Easy app. Keep your responses concise and conversational."
                },
            });
        } catch (e) {
            console.error("Failed to start conversation:", e);
            setError("Impossible d'accéder au microphone. Veuillez vérifier les autorisations.");
            setStatus('error');
        }
    };
  
    const isConversing = status === 'listening' || status === 'speaking' || status === 'connecting';

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">{t('home_vocalai')}</h1>
            <p className="text-xl text-slate-700 dark:text-slate-400 mb-8">{t('vocalai_subtitle')}</p>

            <div className="w-full h-[28rem] bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-xl p-6 flex flex-col">
                <div ref={transcriptContainerRef} className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {transcripts.map((entry, i) => (
                        <div key={i} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <p className={`max-w-md px-4 py-2 rounded-2xl shadow-sm ${entry.role === 'user' ? 'bg-indigo-500 text-white rounded-bl-none' : 'bg-slate-200 dark:bg-slate-700 rounded-br-none'}`}>
                                {entry.text}
                            </p>
                        </div>
                    ))}
                     {transcripts.length === 0 && (
                        <div className="flex items-center justify-center h-full text-slate-500">
                           {status === 'idle' && t('vocalai_cta_start')}
                           {status === 'connecting' && t('vocalai_status_connecting')}
                        </div>
                     )}
                </div>
                <div className="pt-4 border-t border-white/10 dark:border-slate-800/50">
                    <StatusIndicator status={status} />
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
                <button
                    onClick={isConversing ? stopConversation : startConversation}
                    className={`relative w-24 h-24 rounded-full font-bold shadow-lg transition-all duration-300 flex items-center justify-center text-white text-lg transform hover:scale-110
                        ${isConversing ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                    {isConversing ? t('vocalai_stop_button') : t('vocalai_start_button')}
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
        </div>
    );
};