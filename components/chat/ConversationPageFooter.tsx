'use client';

import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { IoIosSend } from 'react-icons/io';
import { Textarea } from '@/components/ui/textarea';

export interface ConversationPageFooterProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  sendError: string | null;
  setSendError: (error: string | null) => void;
  sending: boolean;
}

export default function ConversationPageFooter({
  messageInput,
  setMessageInput,
  onSubmit,
  sendError,
  setSendError,
  sending,
}: ConversationPageFooterProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!sending) {
      textareaRef.current?.focus();
    }
  }, [sending]);

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="shrink-0 p-3 mb-3"
      style={{
        backgroundColor: '#acdbff',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23030106' fill-opacity='0.06' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      }}
    >
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          aria-label="Message"
          aria-describedby={sendError ? 'message-send-error' : undefined}
          placeholder="Type a message..."
          value={messageInput}
          onChange={(event) => {
            setMessageInput(event.target.value);

            if (sendError) {
              setSendError(null);
            }
          }}
          onKeyDown={handleTextareaKeyDown}
          disabled={sending}
          rows={1}
          className="!bg-comatch-background max-h-32 min-h-12 resize-none rounded-xl border-gray-200 px-4 py-3 text-sm font-medium focus-visible:bg-white"
        />

        <button
          type="submit"
          aria-label="Send message"
          disabled={sending || !messageInput.trim()}
          className="flex size-12 shrink-0 items-center justify-center rounded-xl  text-blue-800 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-comatch-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IoIosSend className="size-6" aria-hidden="true" />
        </button>
      </div>

      {sendError ? (
        <p
          id="message-send-error"
          role="alert"
          className="mt-2 px-1 text-xs font-medium text-red-600"
        >
          {sendError}
        </p>
      ) : null}
    </form>
  );
}
