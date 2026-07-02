import type { Message } from "../types";

type MessageBubbleProps = {
  message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className="genchat-message-row" data-role={message.role}>
      {message.role === "assistant" ? <div className="genchat-avatar">G</div> : null}
      <div>
        <div className="genchat-message">{message.content}</div>
        {message.citations?.length ? (
          <div className="genchat-citations">
            {message.citations.map((citation) => (
              <span className="genchat-citation" key={`${citation.sourceId}:${citation.label}`}>
                {citation.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
