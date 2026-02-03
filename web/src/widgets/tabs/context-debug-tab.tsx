import { useRef, useState } from "react";
import { useDisplayMode, useLayout, useUser } from "skybridge/web";
import { useToolInfo } from "../../helpers";
import { useWidgetState } from "skybridge/web";

type SkybridgeContext = {
  displayMode?: string;
  maxWidth?: number;
  maxHeight?: number;
  theme?: string;
  locale?: string;
  userAgent?: {
    device?: { type?: string; platform?: string };
    capabilities?: { hover?: boolean; touch?: boolean };
  };
  isSidebarOpen?: boolean;
  widget?: {
    state?: unknown;
    props?: Record<string, unknown>;
  };
  toolInput?: unknown;
  toolOutput?: unknown;
  toolResponseMetadata?: unknown;
  widgetState?: unknown;
  subjectId?: string;
  view?: {
    params?: Record<string, unknown>;
    mode?: string;
  };
  safeArea?: {
    insets: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  // Additional props from runWidgetCode
  html?: string;
  isFirstParty?: boolean;
  widgetId?: string;
  viewParams?: Record<string, unknown>;
  measureWidth?: boolean;
  features?: unknown;
  csp?: unknown;
};

// Global logger that captures context on every interaction
let contextLogger: ((context: SkybridgeContext) => void) | null = null;

export function setContextLogger(fn: (context: SkybridgeContext) => void) {
  contextLogger = fn;
}

export function getContextLogger() {
  return contextLogger;
}

export function ContextDebugTab() {
  const layout = useLayout();
  const user = useUser();
  const [displayMode] = useDisplayMode();
  const toolInfo = useToolInfo<"show-everything">();
  const [widgetState] = useWidgetState({});

  const initialRef = useRef<SkybridgeContext | null>(null);
  const [history] = useState<Array<{ time: string; value: SkybridgeContext }>>([]);
  const [showFullContext, setShowFullContext] = useState(false);

  // Try to access the raw context or window globals that ChatGPT sets
  const rawContext = (window as any).__SKYBRIDGE_CONTEXT__ || (window as any).__APPS_SDK_CONTEXT__ || (window as any).openai;

  // Collect all context values matching the structure from your example
  const allValues: SkybridgeContext = {
    displayMode: displayMode,
    maxWidth: (layout as any).maxWidth || rawContext?.maxWidth,
    maxHeight: (layout as any).maxHeight || rawContext?.maxHeight,
    theme: (layout as any).theme || layout.theme,
    locale: user.locale,
    userAgent: user.userAgent,
    isSidebarOpen: rawContext?.isSidebarOpen,
    widget: {
      state: widgetState,
      props: toolInfo.output as Record<string, unknown> | undefined,
    },
    toolInput: toolInfo.input,
    toolOutput: toolInfo.output,
    toolResponseMetadata: toolInfo.responseMetadata,
    widgetState: widgetState,
    subjectId: rawContext?.subjectId,
    view: (layout as any).view || rawContext?.view || {
      params: (layout as any).view?.params || rawContext?.viewParams,
      mode: displayMode,
    },
    safeArea: (layout as any).safeArea || rawContext?.safeArea,
    // Additional props
    html: rawContext?.html,
    isFirstParty: rawContext?.isFirstParty,
    widgetId: rawContext?.widgetId,
    viewParams: (layout as any).view?.params || rawContext?.viewParams,
    measureWidth: rawContext?.measureWidth,
    features: rawContext?.features,
    csp: rawContext?.csp,
  };

  // Capture initial value once
  // if (initialRef.current === null) {
  //   initialRef.current = structuredClone(allValues);
  //   console.log("🟢 INITIAL Skybridge Context:", JSON.stringify(allValues, null, 2));
  //   console.log("🟢 INITIAL Skybridge Context (object):", allValues);
  // }

  // // Track all updates and log on every interaction
  // useEffect(() => {
  //   const timestamp = new Date().toISOString();
  //   const timeStr = timestamp.split("T")[1].split(".")[0];
    
  //   // Log to console with nice formatting
  //   console.group(`🔄 Skybridge Context Update - ${timeStr}`);
  //   console.log("Full Context:", JSON.stringify(allValues, null, 2));
  //   console.log("Context Object:", allValues);
  //   console.groupEnd();
    
  //   // Call global logger if set
  //   if (contextLogger) {
  //     contextLogger(allValues);
  //   }
    
  //   // Update history
  //   setHistory((h) => [...h.slice(-9), { time: timeStr, value: structuredClone(allValues) }]);
  // }, [JSON.stringify(allValues)]);

  return (
    <div className="tab-content">
      <p className="description">
        Debug tab to inspect all context values passed by ChatGPT. The full context is logged to console on every update.
      </p>

      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            console.log("📋 Current Skybridge Context:", JSON.stringify(allValues, null, 2));
            console.log("📋 Current Skybridge Context (object):", allValues);
          }}
        >
          📋 Log Current Context to Console
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowFullContext(!showFullContext)}
        >
          {showFullContext ? "▼" : "▶"} Full Context JSON
        </button>
      </div>

      {showFullContext && (
        <div className="field">
          <span className="field-label">Complete Skybridge Context (matches your example structure):</span>
          <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "400px", backgroundColor: "var(--bg-secondary)", padding: "1rem", borderRadius: "4px" }}>
            {JSON.stringify(allValues, null, 2)}
          </pre>
        </div>
      )}

      <div className="field">
        <span className="field-label">displayMode:</span>
        <code>{allValues.displayMode ?? "not found"}</code>
      </div>

      <div className="field">
        <span className="field-label">maxWidth:</span>
        <code>{JSON.stringify(allValues.maxWidth ?? "not found")}</code>
      </div>

      <div className="field">
        <span className="field-label">maxHeight:</span>
        <code>{JSON.stringify(allValues.maxHeight ?? "not found")}</code>
      </div>

      <div className="field">
        <span className="field-label">theme:</span>
        <code>{allValues.theme ?? "not found"}</code>
      </div>

      <div className="field">
        <span className="field-label">locale:</span>
        <code>{allValues.locale ?? "not found"}</code>
      </div>

      <div className="field">
        <span className="field-label">userAgent:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.userAgent ?? "not found", null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">isSidebarOpen:</span>
        <code>{JSON.stringify(allValues.isSidebarOpen ?? "not found")}</code>
      </div>

      <div className="field">
        <span className="field-label">widget.state:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.widget?.state ?? "not found", null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">widget.props:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.widget?.props ?? "not found", null, 2)}
        </pre>
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
        <span className="field-label">widgetState:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.widgetState ?? "not found", null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">subjectId:</span>
        <code>{allValues.subjectId ?? "not found"}</code>
      </div>

      <div className="field">
        <span className="field-label">view:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.view ?? "not found", null, 2)}
        </pre>
      </div>

      <div className="field">
        <span className="field-label">safeArea:</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "100px" }}>
          {JSON.stringify(allValues.safeArea ?? "not found", null, 2)}
        </pre>
      </div>

      {rawContext && (
        <div className="field">
          <span className="field-label">Raw window context (window.openai / __SKYBRIDGE_CONTEXT__):</span>
          <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "200px" }}>
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
        <span className="field-label">Recent updates (last 10):</span>
        <pre style={{ fontSize: "0.75rem", overflow: "auto", maxHeight: "200px" }}>
          {history.length > 0
            ? history.map((h, i) => `[${i + 1}] ${h.time}\n${JSON.stringify(h.value, null, 2)}`).join("\n\n")
            : "No updates yet"}
        </pre>
      </div>

      <p className="description" style={{ marginTop: "1rem" }}>
        💡 <strong>Every interaction logs the full context to console.</strong> Open DevTools to see:
        <br />
        • 🟢 INITIAL - First render context
        <br />
        • 🔄 UPDATE - Context on every change (grouped logs)
        <br />
        • Use the "📋 Log Current Context" button to manually log anytime
      </p>
    </div>
  );
}
