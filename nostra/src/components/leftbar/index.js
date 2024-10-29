import "@xyflow/react/dist/style.css";

export default function LeftBar({
  onDragStart,
  actionList,
  agents,
  setIsModalOpen,
  getNodeRelationships,
}) {
  return (
    <div
      style={{
        width: "200px",
        padding: "20px",
        background: "linear-gradient(to right, #e9e9e9, #ffffff)",
        overflowY: "auto",
        color: "black",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h3
          style={{
            marginTop: "40px",
          }}
        >
          Actions
        </h3>
        {actionList.map((action) => (
          <div
            key={action.id}
            draggable
            onDragStart={(event) => onDragStart(event, action.id, true)}
            style={{
              margin: "10px 0",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              cursor: "move",
            }}
          >
            {action.label}
          </div>
        ))}
        <h3
          style={{
            marginTop: "24px",
          }}
        >
          Agents
        </h3>
        {agents.map((agent, index) => (
          <div
            key={index}
            draggable
            onDragStart={(event) => onDragStart(event, agent.name, false)}
            style={{
              margin: "10px 0",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              cursor: "move",
            }}
          >
            {agent.name}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          gap: "10px",
        }}
      >
        <button
          styled={{
            minWidth: "100%",
          }}
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Create Agent
        </button>
        <button
          styled={{
            minWidth: "100%",
          }}
          onClick={() => {
            getNodeRelationships();
          }}
        >
          Excute
        </button>
      </div>
    </div>
  );
}
