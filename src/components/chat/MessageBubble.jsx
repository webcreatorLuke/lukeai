// src/components/chat/MessageBubble.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm     from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, User, Sparkles } from 'lucide-react';
import { cn, copyToClipboard, formatTimestamp } from '@utils/helpers';
import { useAuth } from '@hooks/useAuth';
import { parseMessageForContent } from '@utils/messageParser';
import ChatImage from '@components/chat/ChatImage';
import GeneratedImage from '@components/chat/GeneratedImage';
import FileBlock from '@components/chat/FileBlock';

export default function MessageBubble({ message }) {
  const { user }     = useAuth();
  const isUser       = message.role === 'user';
  const isStreaming  = message.isStreaming;

  // Split assistant messages into text/image/file segments based on tags
  const segments = !isUser ? parseMessageForContent(message.content) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 text-xs font-bold',
        isUser
          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
          : 'bg-gradient-to-br from-cyan-500 to-purple-500 text-white'
      )}>
        {isUser
          ? (user?.displayName?.[0]?.toUpperCase() || <User size={14} />)
          : <Sparkles size={14} />
        }
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[80%] min-w-0', isUser ? 'items-end flex flex-col' : '')}>
        <div className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-neon-purple text-white rounded-tr-sm'
            : 'bg-surface-raised border border-surface-border text-text-primary rounded-tl-sm'
        )}>
          {isUser ? (
            <>
              {message.images?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 justify-end">
                  {message.images.map((img, i) => (
                    <img
                      key={i}
                      src={img.dataUrl}
                      alt="Attached"
                      className="max-w-[160px] max-h-[160px] rounded-lg border border-white/20 object-cover cursor-pointer"
                      onClick={() => window.open(img.dataUrl, '_blank')}
                    />
                  ))}
                </div>
              )}
              {message.content && (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              )}
            </>
          ) : (
            <div className={cn('prose-message', isStreaming && 'typing-cursor')}>
              {segments.map((segment, i) => {
                if (segment.type === 'image-search') {
                  return <ChatImage key={i} query={segment.query} />;
                }
                if (segment.type === 'image-gen') {
                  return <GeneratedImage key={i} prompt={segment.prompt} />;
                }
                if (segment.type === 'file') {
                  return <FileBlock key={i} filename={segment.filename} content={segment.content} />;
                }
                if (!segment.content.trim()) return null;
                return (
                  <ReactMarkdown
                    key={i}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        if (!inline && match) {
                          return (
                            <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
                          );
                        }
                        return (
                          <code className="bg-surface-overlay text-purple-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {segment.content}
                  </ReactMarkdown>
                );
              })}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {message.createdAt && !isStreaming && (
          <span className="text-2xs text-text-muted mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTimestamp(message.createdAt)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Inline code block with copy button ──────────────────────────────────────
function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative my-2 rounded-xl overflow-hidden border border-surface-border">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-overlay border-b border-surface-border">
        <span className="text-2xs text-text-muted font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-2xs text-text-muted hover:text-text-primary transition-colors"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, background: '#13131a', fontSize: '0.8125rem' }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
