import { ContextFilesPicker } from "./ContextFilesPicker";
import { ModelPicker } from "./ModelPicker";
import { ProModeSelector } from "./ProModeSelector";
import { ChatModeSelector } from "./ChatModeSelector";

export function ChatInputControls({
  showContextFilesPicker = false,
}: {
  showContextFilesPicker?: boolean;
}) {
  return (
    <div className="flex">
      <ChatModeSelector />
      <div className="w-1.5"></div>
      <ModelPicker />
      <div className="w-1.5"></div>
      <ProModeSelector isProMode={false} onToggle={() => { /* TODO: implement */ }} />
      <div className="w-1"></div>
      {showContextFilesPicker && (
        <>
          <ContextFilesPicker files={[]} selectedFiles={[]} onSelectionChange={() => { /* TODO: implement */ }} />
          <div className="w-0.5"></div>
        </>
      )}
    </div>
  );
}
