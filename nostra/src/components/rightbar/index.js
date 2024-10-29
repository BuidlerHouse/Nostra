import "@xyflow/react/dist/style.css";

export default function RightBar({ selectedNode, removeNodeFromPad }) {
  return (
    <>
      {selectedNode && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            width: "250px",
            padding: "20px",
            background: "#f0f0f0",
            overflowY: "auto",
            color: "black",
            cursor: "default",
            zIndex: "20",
          }}
        >
          <h3>Node Details</h3>
          <p>ID: {selectedNode.id}</p>
          <p>Type: {selectedNode.data.type}</p>
          <p>Label: {selectedNode.data.label}</p>
          <button
            onClick={() => {
              removeNodeFromPad(selectedNode.id);
            }}
          >
            delete
          </button>
        </div>
      )}
    </>
  );
}
