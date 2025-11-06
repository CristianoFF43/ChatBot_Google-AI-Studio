import React from 'react';
import { Message, ChatRole, MessagePart, ImagePart } from '../types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: Message;
}

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 015.69 3.117.75.75 0 01-.879 1.129 5.227 5.227 0 00-10.62 0 .75.75 0 01-.879-1.129z" clipRule="evenodd" />
        <path d="M12.75 18a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0v-.75z" />
    </svg>
);


const MarkdownRenderer = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            className="prose prose-invert prose-sm md:prose-base max-w-none prose-p:before:content-none prose-p:after:content-none"
            components={{
                code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                        <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code className="text-cyan-400 bg-slate-700/50 px-1 py-0.5 rounded" {...props}>
                            {children}
                        </code>
                    );
                },
                a: ({ node, ...props }) => <a {...props} className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer" />,
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

interface PartRendererProps {
    part: MessagePart;
}

// Fix: Explicitly typed PartRenderer as React.FC to resolve the TypeScript error
// where the special 'key' prop was not being correctly handled.
const PartRenderer: React.FC<PartRendererProps> = ({ part }) => {
    if (part.type === 'text') {
        return <MarkdownRenderer content={part.content} />;
    }
    if (part.type === 'image') {
        return (
            <div className="mt-2">
                <img src={part.content.preview} alt="User upload" className="max-w-xs rounded-lg border-2 border-slate-600" />
            </div>
        );
    }
    return null;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === ChatRole.USER;

  const containerClasses = isUser ? 'flex justify-end' : 'flex justify-start';
  const bubbleClasses = isUser
    ? 'bg-purple-600 text-white rounded-lg rounded-br-none'
    : 'bg-slate-800 text-slate-200 rounded-lg rounded-bl-none';
  const icon = isUser ? <UserIcon className="w-8 h-8 text-slate-400" /> : <BotIcon className="w-8 h-8 text-cyan-400" />;
  const contentOrder = isUser ? 'order-1' : 'order-2';
  const iconOrder = isUser ? 'order-2 ml-3' : 'order-1 mr-3';

  return (
    <div className={`${containerClasses} items-start`}>
      <div className={`${iconOrder} self-start`}>
        {icon}
      </div>
      <div className={`${bubbleClasses} ${contentOrder} p-4 max-w-lg lg:max-w-2xl`}>
        {message.parts.map((part, index) => <PartRenderer key={index} part={part} />)}
      </div>
    </div>
  );
};