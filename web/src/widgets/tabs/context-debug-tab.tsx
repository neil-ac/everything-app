import { useEffect, useRef, useState } from "react";
import { useDisplayMode, useLayout, useUser } from "skybridge/web";
import { useToolInfo } from "../../helpers";
import { useWidgetState } from "skybridge/web";

type AllContextValues = {
  // From runWidgetCode props
  html?: string;
  isFirstParty?: boolean;
  widgetId?: string;
  widgetState?: unknown;
  viewParams?: Record<string, unknown>;
  maxHeight?: number;
  maxWidth?: number;
  toolInput?: unknown;
  toolOutput?: unknown;
  toolResponseMetadata?: unknown;
  subjectId?: string;
  displayMode?: string;
  measureWidth?: boolean;
  theme?: string;
  userAgent?: unknown;
  safeArea?: { insets: { top: number; bottom: number; left: number; right: number } };
  features?: unknown;
  csp?: unknown;
  view?: { mode: string; params?: Record<string, unknown> };
};

export function ContextDebugTab() {
  const layout = useLayout();
  const user = useUser();
  const [displayMode] = useDisplayMode();
  const toolInfo = useToolInfo<"show-everything">();
  const [widgetState] = useWidgetState({});

  const initialRef = useRef<AllContextValues | null>(null);
  const [history, setHistory] = useState<Array<{ time: string; value: AllContextValues }>>([]);

  // Try to access the raw context or window globals that ChatGPT sets
  const rawContext = (window as any).__SKYBRIDGE_CONTEXT__ || (window as any).__APPS_SDK_CONTEXT__ || (window as any).openai;

  // Collect all context values
  const allValues: AllContextValues = {
    html: rawContext?.html,
    isFirstParty: rawContext?.isFirstParty,
    widgetId: rawContext?.widgetId,
    widgetState: widgetState,
    viewParams: (layout as any).view?.params || rawContext?.viewParams,
    maxHeight: (layout as any).maxHeight || rawContext?.maxHeight,
    maxWidth: rawContext?.maxWidth,
    toolInput: toolInfo.input,
    toolOutput: toolInfo.output,
    toolResponseMetadata: toolInfo.responseMetadata,
    subjectId: rawContext?.subjectId,
    displayMode: displayMode,
    measureWidth: rawContext?.measureWidth,
    theme: (layout as any).theme || layout.theme,
    userAgent: user.userAgent,
    safeArea: (layout as any).safeArea || rawContext?.safeArea,
    features: rawContext?.features,
    csp: rawContext?.csp,
    view: (layout as any).view || rawContext?.view || { mode: displayMode },
  };

  // Capture initial value once
  if (initialRef.current === null) {
    initialRef.current = structuredClone(allValues);
    console.log("🟢 INITIAL all context values:", allValues);
  }

  // Track all updates
  useEffect(() => {
    const timestamp = new Date().toISOString().split("T")[1];
    console.log(`🔄 UPDATE at ${timestamp}:`, allValues);
    setHistory((h) => [...h, { time: timestamp, value: structuredClone(allValues) }]);
  }, [JSON.stringify(allValues)]);

  return (
    <div className="tab-content">
      <p className="description">
        Debug tab to inspect all context values passed by ChatGPT when initializing the widget.
        These are the parameters that <code>runWidgetCode</code> accepts.
      </p>

      <div className="field">
        <span className="field-label">html:</span>
        <code>{allValues.html ? `${allValues.html.substring(0, 50)}...` : "not found"}</code>
      </div>

      <div className="field">
        <span className="field-label">isFirstParty:</span>
        <code>{JSON.stringify(allValues.isFirstParty ?? "not found")}</code>
      </div>

      <div className="field">
        <span className="field-label">widgetId:</span>
        <code>{allValues.widgetId ?? "not found"}</code>
      </div>

      <div className="field">
        <span className="field-label">widgetState:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.widgetState, null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">viewParams:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.viewParams ?? "not found", null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">maxHeight:</span>
        <code>{JSON.stringify(allValues.maxHeight ?? "not found")}</code>
      </div>

      <div className="field">
        <span className="field-label">maxWidth:</span>
        <code>{JSON.stringify(allValues.maxWidth ?? "not found")}</code>
      </div>

      <div className="field">
        <span className="field-label">toolInput:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.toolInput ?? "not found", null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">toolOutput:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.toolOutput ?? "not found", null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">toolResponseMetadata:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.toolResponseMetadata ?? "not found", null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">subjectId:</span>
        <code>{allValues.subjectId ?? "not found"}</code>
      </div>

      <div className="field">
        <span className="field-label">displayMode:</span>
        <code>{allValues.displayMode ?? "not found"}</code>
      </div>

      <div className="field">
        <span className="field-label">measureWidth:</span>
        <code>{JSON.stringify(allValues.measureWidth ?? "not found")}</code>
      </div>

      <div className="field">
        <span className="field-label">theme:</span>
        <code>{allValues.theme ?? "not found"}</code>
      </div>

      <div className="field">
        <span className="field-label">userAgent:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "150px" }}>
          {JSON.stringify(allValues.userAgent ?? "not found", null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">safeArea:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.safeArea ?? "not found", null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">features:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.features ?? "not found", null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">csp:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.csp ?? "not found", null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">view:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.view ?? "not found", null, 2)}
        </pre>
      </div>

      {rawContext && (
        <div className="field">
          <span className="field-label">Raw window context (window.openai / __SKYBRIDGE_CONTEXT__):</span>
          <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "300px" }}>
            {JSON.stringify(rawContext, null, 2)}
          </pre>
        </div>
      )}

      <div className="field">
        <span className="field-label">Initial values (on first render):</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "200px" }}>
          {JSON.stringify(initialRef.current, null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">Update history ({history.length} updates):</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "200px" }}>
          {history.length > 0
            ? history.map((h) => `${h.time}: ${JSON.stringify(h.value)}`).join("\n\n")
            : "No updates yet"}
        </pre>
      </div>

      <p className="description" style={{ marginTop: "1rem" }}>
        Console shows 🟢 INITIAL and 🔄 UPDATE logs with timestamps. Check DevTools to see full objects.
      </p>
    </div>
  );
}
