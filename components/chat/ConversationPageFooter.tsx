"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { IoIosSend } from "react-icons/io";
import { Textarea } from "@/components/ui/textarea";

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
  const handleTextareaKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="shrink-0 bg-transparent p-3"
    >
      <div className="flex items-end gap-2">
        <Textarea
          aria-label="Message"
          aria-describedby={sendError ? "message-send-error" : undefined}
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
          className="max-h-32 min-h-12 resize-none rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus-visible:bg-white"
        />

        <button
          type="submit"
          aria-label="Send message"
          disabled={sending || !messageInput.trim()}
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-comatch-primary text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-comatch-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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