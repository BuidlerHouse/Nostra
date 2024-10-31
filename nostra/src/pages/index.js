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
import { actionList, defaultAgents } from "@/utils/constant";
import RightBar from "@/components/rightbar";
import AgentModal from "@/components/agentmodal";
import Excution from "@/components/excution";

export default function Home() {
  const { signedAccountId, wallet } = useContext(NearContext);
  const { screenToFlowPosition, getZoom } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [excutionInfo, setExcutionInfo] = useState(null);
  const [isExcutionModalOpen, setIsExcutionModalOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    id: "",
    label: "",
    name: "🤖 Bot",
    description: "",
    prompt: "",
  });

  const [agents, setAgents] = useState([]);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const contractAgents = await wallet.viewMethod({
          contractId: "nostra.opshenry.near",
          method: "get_agents"
        });

        // Transform defaultAgents to match contract format
        const formattedDefaultAgents = defaultAgents.map(agent => ({
          name: agent.name,
          description: agent.description,
          prompt: agent.prompt
        }));

        // Combine contract agents with default agents
        const allAgents = [...contractAgents, ...formattedDefaultAgents].map(agent => ({
          id: agent.name,
          label: agent.name,
          name: agent.name,
          type: "agent",
          description: agent.description,
          prompt: agent.prompt
        }));

        setAgents(allAgents);
      } catch (error) {
        console.error("Error loading agents:", error);
        // Fallback to default agents if contract call fails
        setAgents(defaultAgents);
      }
    };

    loadAgents();
  }, [wallet]);

  const getNodeRelationships = () => {
    try {
      const relationshipMap = {};

      // Initialize relationshipMap with node details
      nodes.forEach((node) => {
        relationshipMap[node.id] = {
          ...node.data, // Add data properties like label, name, description, etc.
          parent: null,
          children: [],
        };
      });

      // Update relationshipMap with edges information
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

      // Build relationshipList based on parent-child structure
      const relationshipList = [];
      const addedNodes = new Set();

      // Helper function to add node and its children
      const addNodeWithChildren = (nodeId) => {
        if (addedNodes.has(nodeId)) return; // Avoid duplicate entries

        const node = relationshipMap[nodeId];
        const nodeData = {
          id: nodeId,
          label: node.label,
          type: node.type,
          parent: node.parent,
          children: node.children,
          prompt: node.prompt,
          description: node.description,
          status: "loading",
        };

        relationshipList.push(nodeData);
        addedNodes.add(nodeId);

        // Recursively add children
        node.children.forEach((childId) => addNodeWithChildren(childId));
      };

      // Start with nodes having parent as null
      Object.keys(relationshipMap).forEach((nodeId) => {
        if (relationshipMap[nodeId].parent === null) {
          addNodeWithChildren(nodeId);
        }
      });

      // Set list as JSON string for modal display
      setExcutionInfo(relationshipList);
      setIsExcutionModalOpen(true);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    try {
      const relationshipMap = {};

      // Initialize relationshipMap with node details
      nodes.forEach((node) => {
        relationshipMap[node.id] = {
          ...node.data, // Add data properties like label, name, description, etc.
          parent: null,
          children: [],
        };
      });

      // Update relationshipMap with edges information
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
    } catch (e) {
      console.error("Error building relationshipMap:", e);
    }
  }, [nodes, edges]);

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
          data: {
            label: action.label,
            type: action.type || "agent",
          },
          style: { color: "black" },
        };
      } else {
        const agent = agents.find((a) => a.id === type);
        newNode = {
          id: `${type}-${nodes.length + 1}`,
          position,
          data: {
            label: `${type} agent`,
            type: "agent",
            description: agent?.description || "Default agent description",
            prompt: agent?.prompt || "Default agent prompt",
          },
          style: { color: "black" },
        };
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, setNodes, actionList, agents]
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
    const agentWithIdAndLabel = {
      ...newAgent,
      id: newAgent.name,
      label: newAgent.name,
    };
    setAgents((prev) => [...prev, agentWithIdAndLabel]);
    setNewAgent({
      id: "",
      label: "",
      name: "",
      description: "",
      prompt: "",
      type: "agent",
    });
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
            getNodeRelationships={getNodeRelationships}
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
          {isExcutionModalOpen && (
            <Excution
              excutionInfo={excutionInfo}
              setExcutionInfo={setExcutionInfo}
            />
          )}
        </div>
      )}
    </main>
  );
}
