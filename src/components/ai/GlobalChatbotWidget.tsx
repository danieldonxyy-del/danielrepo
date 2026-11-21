import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Send,
  Trash2,
  Bot,
  User,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AIMessage } from '../../types';
import { aiService } from '../../services/aiService';
import { Button } from '../ui/button';
import { formatCampusDate } from '../../utils/campusDate';

const formatMessageTime = () =>
  `${formatCampusDate(new Date(), { hour: '2-digit', minute: '2-digit' })} WITA`;

export const GlobalChatbotWidget: React.FC = () => {
  const {
    events,
    announcements,
    student,
    registrations,
    isGlobalAIChatOpen,
    setIsGlobalAIChatOpen,
    globalAIChatContextEventId,
    setGlobalAIChatContextEventId,
  } = useApp();

  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      content:
        `Halo! Saya **Asisten AI KlabatSync**.\n\n` +
        `Saya dapat membantu memeriksa agenda, mencari kegiatan Pioneer Chapel yang memberikan Chapel Point, menemukan kegiatan kampus, dan mendeteksi jadwal yang bertabrakan.\n\n` +
        `Jawaban dibatasi pada informasi kampus yang tersedia di KlabatSync.`,
      timestamp: 'Sekarang',
      isSimulated: true,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isGlobalAIChatOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isGlobalAIChatOpen, isMinimized]);

  // Context-aware quick suggestions based on current route
  const getContextSuggestions = () => {
    const p = location.pathname;
    if (p.includes('/events') || p.includes('/explore')) {
      return [
        'Kegiatan apa yang memberikan Chapel Point?',
        'Kegiatan apa yang cocok untuk mahasiswa FIK?',
        'Kapan Youth Vespers diadakan?',
      ];
    }
    if (p.includes('/agenda') || p.includes('/calendar')) {
      return [
        'Apa agenda saya besok?',
        'Apakah ada jadwal yang bertabrakan?',
        'Kapan waktu luang saya pekan ini?',
      ];
    }
    if (p.includes('/announcements')) {
      return [
        'Apa pengumuman terbaru?',
        'Apa aturan pakaian untuk ujian tengah semester?',
        'Berapa batas kehadiran Chapel?',
      ];
    }
    return [
      'Apa agenda saya besok?',
      'Kegiatan apa yang memberikan Chapel Point?',
      'Rekomendasikan kegiatan untuk mahasiswa FIK',
    ];
  };

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: formatMessageTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const response = await aiService.chat(text, {
        page: location.pathname,
        eventId: globalAIChatContextEventId || undefined,
        events,
        announcements,
        student,
        registrations,
      });
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          content: 'Layanan AI kampus tidak dapat dijangkau. Coba lagi nanti.',
          timestamp: formatMessageTime(),
          isSimulated: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: `clear-${Date.now()}`,
        sender: 'ai',
        content: 'Percakapan dihapus. Ada yang ingin Anda cari tentang kegiatan kampus?',
        timestamp: 'Sekarang',
        isSimulated: true,
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isGlobalAIChatOpen && (
        <button
          onClick={() => {
            setIsGlobalAIChatOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-3 z-40 hidden h-11 w-11 items-center justify-center gap-2.5 rounded-full border border-purple-400/30 bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 text-sm font-semibold text-white shadow-lg select-none group lg:bottom-6 lg:right-6 lg:flex lg:h-auto lg:w-auto lg:px-4 lg:py-3"
          aria-label="Buka Asisten AI KlabatSync"
        >
          <div className="relative">
            <Sparkles className="h-4 w-4 text-amber-300" />
          </div>
          <span className="hidden tracking-wide lg:inline">Tanya Asisten AI</span>
        </button>
      )}

      {/* Expanded Floating Chat Window */}
      {isGlobalAIChatOpen && (
        <div
          className={`fixed z-50 right-3 sm:right-6 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] lg:bottom-6 w-[calc(100vw-1.5rem)] sm:w-96 max-h-[calc(100dvh-6rem-env(safe-area-inset-bottom))] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden ${
            isMinimized ? 'h-14' : 'h-[520px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                <Sparkles className="h-4 w-4 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight">Asisten AI KlabatSync</h3>
                <p className="text-xs text-purple-200 flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Simulasi · data kampus UNKLAB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClear}
                aria-label="Hapus percakapan"
                className="h-9 w-9 rounded-lg flex items-center justify-center text-purple-200 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                title="Hapus percakapan"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label={isMinimized ? 'Perbesar jendela asisten' : 'Perkecil jendela asisten'}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-purple-200 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                title={isMinimized ? 'Perbesar' : 'Perkecil'}
              >
                {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsGlobalAIChatOpen(false)}
                aria-label="Tutup asisten"
                className="h-9 w-9 rounded-lg flex items-center justify-center text-purple-200 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body when not minimized */}
          {!isMinimized && (
            <>
              {/* Context bar if an event is targeted */}
              {globalAIChatContextEventId && (
                <div className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 border-b border-purple-100 dark:border-purple-900/40 text-[11px] text-purple-800 dark:text-purple-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium truncate">
                    <Calendar className="h-3 w-3 shrink-0" />
                    Fokus: {events.find((e) => e.id === globalAIChatContextEventId)?.title || 'Kegiatan'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGlobalAIChatContextEventId(null)}
                    aria-label="Hapus fokus kegiatan dari percakapan"
                    className="text-[10px] underline ml-2 shrink-0 hover:text-purple-950"
                  >
                    Hapus fokus
                  </button>
                </div>
              )}

              {/* Messages list */}
              <div aria-live="polite" className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="h-7 w-7 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-slate-100 rounded-bl-xs'
                        }`}
                      >
                        <div className="whitespace-pre-line text-xs font-normal">
                          {msg.content}
                        </div>

                        {/* Grounded Source Attributions */}
                        {msg.sourceAttributions && msg.sourceAttributions.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs space-y-0.5">
                            <span className="font-semibold text-slate-500">Sumber:</span>
                            {msg.sourceAttributions.map((s, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <span>• {s.title} ({s.module})</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div
                          className={`text-xs mt-1 text-right ${
                            isUser ? 'text-blue-200' : 'text-slate-400'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>
                      {isUser && (
                        <div className="h-7 w-7 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          <User className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex gap-2.5 items-center text-xs text-slate-400">
                    <div className="h-7 w-7 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center shrink-0 animate-pulse">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center gap-1 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce delay-100" />
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce delay-200" />
                      <span className="ml-1 text-[11px] font-medium text-purple-700 dark:text-purple-300">
                        Memeriksa informasi kampus...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestion prompt chips */}
              <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {getContextSuggestions().map((sugg, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sugg)}
                    className="whitespace-nowrap rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-colors shrink-0 shadow-2xs"
                  >
                    {sugg}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    aria-label="Tulis pesan untuk asisten AI"
                    name="message"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tanyakan tentang kegiatan, agenda, atau Poin Chapel…"
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <Button
                    type="submit"
                    variant="purple"
                    size="sm"
                    disabled={!input.trim() || loading}
                    className="h-8 w-8 p-0 rounded-xl shrink-0"
                    aria-label="Kirim pesan"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>Mengacu pada data KlabatSync</span>
                  <span className="flex items-center gap-0.5">
                    <ShieldAlert className="h-3 w-3 text-purple-500" /> Informasi kampus saja
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
