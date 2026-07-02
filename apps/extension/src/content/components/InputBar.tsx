import { useState } from "react";
import { IconArrowUp } from "./Icons";

type InputBarProps = {
  disabled?: boolean;
  onSubmit: (message: string) => void;
};

export function InputBar({ disabled, onSubmit }: InputBarProps) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <div className="genchat-input-wrap">
      <div className="genchat-input-row">
        <input
          className="genchat-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask about this page..."
          disabled={disabled}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
        />
        <button className="genchat-send-button" type="button" onClick={submit} disabled={disabled || !value.trim()}>
          <IconArrowUp size={18} />
        </button>
      </div>
      <div className="genchat-status">GenChat only sends context after you open it or ask something.</div>
    </div>
  );
}
