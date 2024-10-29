import { useContext, useState, useCallback, useRef, useEffect } from "react";
import styles from "@/styles/app.module.css";
import Logo from "/public/nostra.png";
import { NearContext } from "@/wallets/near";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "@xyflow/react";
import { Controls, Background, addEdge, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Welcome from "@/components/welcome";
import LeftBar from "@/components/leftbar";
import { actionList } from "@/utils/constant";
import RightBar from "@/components/rightbar";
import AgentModal from "@/components/agentmodal";

export default function Home() {
  const { signedAccountId } = useContext(NearContext);
  const { screenToFlowPosition, getZoom } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: "1",
      position: { x: 250, y: 0 },
      data: { label: "Node 1" },
      style: { color: "black" },
    },
    {
      id: "2",
      position: { x: 350, y: 100 },
      data: { label: "Node 2" },
      style: { color: "black" },
    },
  ]);

  console.log("nodes", nodes);

  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: "e1-2",
      source: "1",
      target: "2",
      animated: true,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", desc: "", prompt: "" });
  const [agents, setAgents] = useState([]);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const relationshipMap = {};

      edges.forEach((edge) => {
        const { source, target } = edge;

        if (!relationshipMap[source]) {
          relationshipMap[source] = { parent: null, children: [] };
        }

        if (!relationshipMap[target]) {
          relationshipMap[target] = { parent: null, children: [] };
        }

        relationshipMap[target].parent = source;

        relationshipMap[source].children.push(target);
      });

      console.log(JSON.stringify(relationshipMap, null, 2));
    } catch (e) {}
  }, [edges]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      ),
    []
  );

  const onDragStart = (event, nodeType, isAction) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("isAction", isAction);
    event.dataTransfer.effectAllowed = "move";

    const nodeRect = event.target.getBoundingClientRect();
    dragOffset.current = {
      x: event.clientX - nodeRect.left,
      y: event.clientY - nodeRect.top,
    };
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const isAction = event.dataTransfer.getData("isAction") === "true";
      let newNode;
      const position = screenToFlowPosition({
        x: event.clientX - dragOffset.current.x * getZoom(),
        y: event.clientY - dragOffset.current.y * getZoom(),
      });
      if (isAction) {
        const action = actionList.find((a) => a.id === type);
        newNode = {
          id: `${type}-${nodes.length + 1}`,
          type: action.type,
          position,
          data: { label: action.label },
          style: { color: "black" },
        };
      } else {
        newNode = {
          id: `${type}-${nodes.length + 1}`,
          type: "default",
          position,
          data: { label: `${type} agent` },
          style: { color: "black" },
        };
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, setNodes, actionList]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === "Delete") {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
      }
    },
    [setNodes, setEdges]
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewAgent({ name: "", desc: "", prompt: "" });
  };

  const removeNodeFromPad = (id) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
    setSelectedNode(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAgent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAgents((prev) => [...prev, newAgent]);
    handleCloseModal();
  };

  return (
    <main className={`${styles.main} ${styles.matrixBackground}`}>
      {!signedAccountId ? (
        <Welcome />
      ) : (
        <div style={{ display: "flex", width: "100%", height: "100%" }}>
          <LeftBar
            onDragStart={onDragStart}
            actionList={actionList}
            agents={agents}
            setIsModalOpen={setIsModalOpen}
          />
          {/* main content */}
          <div
            style={{ flex: 1, position: "relative" }}
            onKeyDown={onKeyDown}
            tabIndex={0}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onDragOver={onDragOver}
              onDrop={onDrop}
              fitView
              style={{
                backgroundImage: `url(${Logo.src})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundBlendMode: "overlay",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              }}
            >
              <Controls />
              <RightBar
                selectedNode={selectedNode}
                removeNodeFromPad={removeNodeFromPad}
              />
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </div>
          <AgentModal
            newAgent={newAgent}
            handleInputChange={handleInputChange}
            isModalOpen={isModalOpen}
            handleSubmit={handleSubmit}
            handleCloseModal={handleCloseModal}
          />
        </div>
      )}
    </main>
  );
}
