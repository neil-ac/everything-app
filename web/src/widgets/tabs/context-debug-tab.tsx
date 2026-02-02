import { useEffect, useRef, useState } from "react";
import { useLayout } from "skybridge/web";

export function ContextDebugTab() {
  const layout = useLayout();
  const initialRef = useRef<typeof layout | null>(null);
  const [history, setHistory] = useState<Array<{ time: string; value: typeof layout }>>([]);

  // Capture initial value once
  if (initialRef.current === null) {
    initialRef.current = structuredClone(layout);
    console.log("🟢 INITIAL layout context:", layout);
  }

  // Track all updates
  useEffect(() => {
    const timestamp = new Date().toISOString().split("T")[1];
    console.log(`🔄 UPDATE at ${timestamp}:`, layout);
    setHistory((h) => [...h, { time: timestamp, value: structuredClone(layout) }]);
  }, [JSON.stringify(layout)]);

  // Try to access the raw context or window globals that ChatGPT sets!
  const rawContext = (window as any).__SKYBRIDGE_CONTEXT__ || (window as any).__APPS_SDK_CONTEXT__;

  return (
    <div className="tab-content">
      <p className="description">
        Debug tab to inspect context values passed by ChatGPT.
      </p>

      <div className="field">
        <span className="field-label">useLayout() returns:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "200px" }}>
          {JSON.stringify(layout, null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">maxHeight:</span>
        <code>{JSON.stringify((layout as any).maxHeight ?? "not in useLayout")}</code>
      </div>

      <div className="field">
        <span className="field-label">safeArea:</span>
        <code>{JSON.stringify((layout as any).safeArea ?? "not in useLayout")}</code>
      </div>

      <div className="field">
        <span className="field-label">view:</span>
        <code>{JSON.stringify((layout as any).view ?? "not in useLayout")}</code>
      </div>

      {rawContext && (
        <div className="field">
          <span className="field-label">Raw window context:</span>
          <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "300px" }}>
            {JSON.stringify(rawContext, null, 2)}
          </pre>
        </div>
      )}

      <div className="field">
        <span className="field-label">Initial value:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "150px" }}>
          {JSON.stringify(initialRef.current, null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">Update history ({history.length} updates):</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "200px" }}>
          {history.map((h) => `${h.time}: ${JSON.stringify(h.value)}`).join("\n")}
        </pre>
      </div>

      <p className="description" style={{ marginTop: "1rem" }}>
        Console shows 🟢 INITIAL and 🔄 UPDATE logs with timestamps.
      </p>
    </div>
  );
}
