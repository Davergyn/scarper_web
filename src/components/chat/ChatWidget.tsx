import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const { chatOpen, toggleChat, chatMessages, addChatMessage } = useAppStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  function handleSend() {
    if (!input.trim()) return;

    addChatMessage({ role: 'user', content: input });
    const userMessage = input;
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `Berdasarkan analisis data, saya menemukan beberapa insight menarik terkait "${userMessage}". Secara keseluruhan, sentimen pengguna cenderung positif dengan engagement yang tinggi pada topik tersebut.`,
        `Baik, saya sudah menganalisis permintaan Anda. Data menunjukkan tren yang konsisten selama 7 hari terakhir. Apakah Anda ingin saya buatkan laporan detail dalam format tertentu?`,
        `Tentu! Saya bisa membantu dengan itu. Berdasarkan data yang sudah dikumpulkan, ada 3 poin utama yang perlu diperhatikan. Ingin saya jelaskan lebih detail?`,
      ];

      addChatMessage({
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
      });
      setIsTyping(false);
    }, 1500);
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xl transition-all duration-300',
          'bg-gradient-to-br from-brand-500 to-accent-violet',
          'hover:shadow-brand-500/30 hover:scale-105',
          'animate-float',
          chatOpen && 'scale-0 opacity-0'
        )}
      >
        <MessageCircle className="h-6 w-6 text-white" />
        {/* Notification dot */}
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-rose text-[8px] font-bold text-white">
          1
        </span>
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 flex w-[380px] flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300',
          'border-surface-200/30 bg-white',
          'dark:border-white/[0.08] dark:bg-surface-900',
          chatOpen
            ? 'h-[520px] scale-100 opacity-100'
            : 'h-0 scale-95 opacity-0 pointer-events-none'
        )}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-surface-200/20 bg-gradient-to-r from-brand-600 to-accent-violet p-4 dark:border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">WebIntel Assistant</h4>
              <p className="flex items-center gap-1 text-[10px] text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald" />
                Always Online
              </p>
            </div>
          </div>
          <button
            onClick={toggleChat}
            className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-2.5',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg',
                  msg.role === 'assistant'
                    ? 'bg-brand-500/10 text-brand-400'
                    : 'bg-accent-cyan/10 text-accent-cyan'
                )}
              >
                {msg.role === 'assistant' ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'rounded-br-md bg-gradient-to-br from-brand-500 to-accent-violet text-white'
                    : 'rounded-bl-md border border-surface-200/20 bg-surface-200/5 text-surface-900 dark:border-white/[0.04] dark:bg-white/[0.03] dark:text-surface-200/80'
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-bl-md border border-surface-200/20 bg-surface-200/5 px-4 py-3 dark:border-white/[0.04] dark:bg-white/[0.03]">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400/40" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400/40" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400/40" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-surface-200/20 p-3 dark:border-white/[0.04]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanya sesuatu..."
              className={cn(
                'h-10 flex-1 rounded-xl border bg-transparent px-4 text-sm outline-none',
                'border-surface-200/20 placeholder:text-surface-200/30',
                'focus:border-brand-400/40',
                'dark:border-white/[0.06] dark:text-white dark:focus:border-brand-400/40'
              )}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                'bg-gradient-to-r from-brand-500 to-accent-violet text-white',
                'hover:shadow-lg hover:shadow-brand-500/25',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
