import "@/index.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { mountWidget, useDisplayMode, useLayout, useOpenExternal, useRequestModal, useUser } from "skybridge/web";
import { useToolInfo } from "../helpers";
import { useWidgetState } from "skybridge/web";
import { CreateStoreTab } from "./tabs/create-store-tab";
import { DataLlmTab } from "./tabs/data-llm-tab";
import { ImageTab } from "./tabs/image-tab";
import { ToolInfoTab } from "./tabs/tool-info-tab";
import { UseCallToolTab } from "./tabs/use-call-tool-tab";
import { UseDisplayModeTab } from "./tabs/use-display-mode-tab";
import { UseFilesTab } from "./tabs/use-files-tab";
import { UseLayoutTab } from "./tabs/use-layout-tab";
import { UseOpenExternalTab } from "./tabs/use-open-external-tab";
import { UseRequestModalTab } from "./tabs/use-request-modal-tab";
import { UseSendFollowUpMessageTab } from "./tabs/use-send-follow-up-message-tab";
import { UseSetOpenInAppUrlTab } from "./tabs/use-set-open-in-app-url";
import { UseUserTab } from "./tabs/use-user-tab";
import { UseWidgetStateTab } from "./tabs/use-widget-state-tab";
import { ContextDebugTab } from "./tabs/context-debug-tab";

const TABS = {
  Home: { docPath: "", Component: ContextDebugTab },
  createStore: { docPath: "create-store", Component: CreateStoreTab },
  "data-llm": { docPath: "data-llm", Component: DataLlmTab },
  image: { docPath: "image", Component: ImageTab },
  useCallTool: { docPath: "use-call-tool", Component: UseCallToolTab },
  useDisplayMode: { docPath: "use-display-mode", Component: UseDisplayModeTab },
  useFiles: { docPath: "use-files", Component: UseFilesTab },
  useLayout: { docPath: "use-layout", Component: UseLayoutTab },
  useOpenExternal: {
    docPath: "use-open-external",
    Component: UseOpenExternalTab,
  },
  useRequestModal: {
    docPath: "use-request-modal",
    Component: UseRequestModalTab,
  },
  useSendFollowUpMessage: {
    docPath: "use-send-follow-up-message",
    Component: UseSendFollowUpMessageTab,
  },
  useSetOpenInAppUrl: {
    docPath: "use-set-open-in-app-url",
    Component: UseSetOpenInAppUrlTab,
  },
  useToolInfo: { docPath: "use-tool-info", Component: ToolInfoTab },
  useUser: { docPath: "use-user", Component: UseUserTab },
  useWidgetState: { docPath: "use-widget-state", Component: UseWidgetStateTab },
};

type Tab = keyof typeof TABS;

function Widget() {
  const [tab, setTab] = useState<Tab>("Home");
  const openExternal = useOpenExternal();
  const { isOpen, params } = useRequestModal();
  
  // Collect context for logging on interactions
  const layout = useLayout();
  const user = useUser();
  const [displayMode, setDisplayMode] = useDisplayMode();
  const toolInfo = useToolInfo<"show-everything">();
  const [widgetState, setWidgetState] = useWidgetState({ count: 0 });
  const rawContext = (window as any).__SKYBRIDGE_CONTEXT__ || (window as any).__APPS_SDK_CONTEXT__ || (window as any).openai;

  // Collect current context
  const getCurrentContext = useCallback(() => {
    return {
      displayMode,
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
      widgetState,
      subjectId: rawContext?.subjectId,
      view: (layout as any).view || rawContext?.view || {
        params: (layout as any).view?.params || rawContext?.viewParams,
        mode: displayMode,
      },
      safeArea: (layout as any).safeArea || rawContext?.safeArea,
    };
  }, [displayMode, layout, user, toolInfo, widgetState, rawContext]);

  // Log widget initialization with full context
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // Use a small timeout to ensure all hooks have settled
      setTimeout(() => {
        const context = getCurrentContext();
        const timestamp = new Date().toISOString();
        const timeStr = timestamp.split("T")[1].split(".")[0];
        
        console.group(`🚀 Widget Initialized - ${timeStr}`);
        console.log("Initialization Context (values passed by host to initialize widget):", JSON.stringify(context, null, 2));
        console.log("Initialization Context (object):", context);
        console.log("Raw window context (window.openai / __SKYBRIDGE_CONTEXT__):", rawContext);
        console.groupEnd();
      }, 0);
    }
  }, [getCurrentContext, rawContext]);

  const serializeForCompare = (value: unknown) => {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  // Log when tools are called by the LLM
  const prevToolInputRef = useRef(serializeForCompare(toolInfo.input));
  const prevToolOutputRef = useRef(toolInfo.output);
  const prevIsPendingRef = useRef(toolInfo.isPending);
  
  useEffect(() => {
    const inputSnapshot = serializeForCompare(toolInfo.input);

    // Detect when a new tool call starts (isPending changes from false to true)
    if (toolInfo.isPending || (inputSnapshot !== prevToolInputRef.current)) {
      const context = getCurrentContext();
      const timestamp = new Date().toISOString();
      const timeStr = timestamp.split("T")[1].split(".")[0];
      
      console.group(`🔧 Tool Call Started by LLM - ${timeStr}`);
      console.log("Tool Input:", toolInfo.input);
      console.log("Full Context:", JSON.stringify(context, null, 2));
      console.log("Full Context (object):", context);
      console.groupEnd();
    }
    
    // Detect when a tool call completes (isPending changes from true to false, or output changes)
    const outputChanged = toolInfo.output && JSON.stringify(toolInfo.output) !== JSON.stringify(prevToolOutputRef.current);
    if ((!toolInfo.isPending && prevIsPendingRef.current) || outputChanged) {
      const context = getCurrentContext();
      const timestamp = new Date().toISOString();
      const timeStr = timestamp.split("T")[1].split(".")[0];
      
      console.group(`✅ Tool Call Completed by LLM - ${timeStr}`);
      console.log("Tool Input:", toolInfo.input);
      console.log("Tool Output:", toolInfo.output);
      console.log("Tool Response Metadata:", toolInfo.responseMetadata);
      console.log("Full Context:", JSON.stringify(context, null, 2));
      console.log("Full Context (object):", context);
      console.groupEnd();
    }
    
    prevToolInputRef.current = inputSnapshot;
    prevToolOutputRef.current = toolInfo.output;
    prevIsPendingRef.current = toolInfo.isPending;
  }, [toolInfo.input, toolInfo.output, toolInfo.responseMetadata, toolInfo.isPending, getCurrentContext]);

  // Expose context globally for easy console access
  useEffect(() => {
    (window as any).__SKYBRIDGE_DEBUG_CONTEXT__ = getCurrentContext;
    (window as any).__SKYBRIDGE_DEBUG_LOG__ = () => {
      const context = getCurrentContext();
      console.log("📋 Current Skybridge Context:", JSON.stringify(context, null, 2));
      console.log("📋 Current Skybridge Context (object):", context);
      return context;
    };
  }, [getCurrentContext]);

  // Log context on every user interaction
  useEffect(() => {
    const logContext = () => {
      const context = getCurrentContext();
      const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
      console.group(`👆 Interaction - ${timestamp}`);
      console.log("Skybridge Context:", JSON.stringify(context, null, 2));
      console.log("Skybridge Context (object):", context);
      console.groupEnd();
    };

    // Log on clicks, keypresses, and other interactions
    const events = ["click", "keydown", "change", "input", "focus"];
    events.forEach((event) => {
      document.addEventListener(event, logContext, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, logContext, true);
      });
    };
  }, [getCurrentContext]);

  const { docPath, Component } = TABS[tab];

  // modal content need to be set at root
  // opening is triggered by UseRequestModalTab
  if (isOpen) {
    let message = "No message provided!!!";
    if (typeof params?.message === "string") {
      message = params.message;
    }
    const currentCount = (widgetState as { count?: number }).count ?? 0;
    const displayModes = ["inline", "pip", "fullscreen", "modal"] as const;
    return (
      <div
        className="container"
        style={{ textAlign: "center", padding: "2rem" }}
      >
        <div style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>
          {message}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.25rem" }}>Counter: </span>
          <code style={{ fontSize: "1.25rem" }}>{currentCount}</code>
        </div>
        <div className="button-row" style={{ marginBottom: "1.5rem" }}>
          <button
            type="button"
            className="btn"
            onClick={() => setWidgetState((prev) => ({ count: (prev.count ?? 0) + 1 }))}
          >
            Increment from Modal
          </button>
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "1rem" }}>Current Display Mode: </span>
          <code>{displayMode}</code>
        </div>
        <div className="button-row">
          {displayModes.map((mode) => (
            <button
              key={mode}
              type="button"
              className={`btn ${displayMode === mode ? "" : "btn-outline"}`}
              onClick={() => setDisplayMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <nav className="tabs">
        {(Object.keys(TABS) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      <Component />

      <div style={{ marginTop: "1.75rem", textAlign: "right" }}>
        <button
          type="button"
          className="btn btn-outline muted btn-small"
          onClick={() =>
            openExternal(`https://docs.skybridge.tech/api-reference/${docPath}`)
          }
        >
          ↗ See in docs
        </button>
      </div>
    </div>
  );
}

export default Widget;

mountWidget(<Widget />);
