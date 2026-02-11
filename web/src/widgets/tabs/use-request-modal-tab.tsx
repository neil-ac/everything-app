import { useRequestModal, useWidgetState } from "skybridge/web";

export function UseRequestModalTab() {
  const { open } = useRequestModal();
  const [state] = useWidgetState({ count: 0 });

  const handleOpenModal = () => {
    open({
      title: "Widget State Counter Modal",
      anchor: {
        top: 100,
        left: 150,
        width: 200,
        height: 40,
      },
      params: {
        message: `🤠 Howdy! Current count: ${state.count ?? 0}`,
        count: state.count ?? 0,
      },
    });
  };

  return (
    <div className="tab-content">
      <p className="description">
        Request to open the widget in a modal dialog.
      </p>

      <div className="field">
        <span className="field-label">Current Count (from widget state)</span>
        <code>{state.count ?? 0}</code>
      </div>

      <div className="button-row">
        <button
          type="button"
          className="btn"
          onClick={handleOpenModal}
        >
          Open modal
        </button>
      </div>
    </div>
  );
}
