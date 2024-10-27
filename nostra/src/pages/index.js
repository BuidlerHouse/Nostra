import Image from 'next/image';
import { useContext, useState, useCallback } from 'react';
import styles from '@/styles/app.module.css';
import Logo from '/public/nostra.png';
import { NearContext } from '@/wallets/near';
import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';
import { Controls, Background, addEdge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function Home() {
  const { signedAccountId, wallet } = useContext(NearContext);
  const [nodes, setNodes, onNodesChange] = useNodesState([
    { id: '1', position: { x: 250, y: 0 }, data: { label: 'Node 1' }, style: { color: 'black' } },
    { id: '2', position: { x: 350, y: 100 }, data: { label: 'Node 2' }, style: { color: 'black' } },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: 'e1-2', source: '1', target: '2', animated: true, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  ]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', desc: '', prompt: '' });
  const [agents, setAgents] = useState([]);

  const actionList = [
    { id: 'input', label: '📥 Input', type: 'input' },
    { id: 'twitter-data', label: '🐦 Twitter Data', type: 'default' },
    { id: 'defi-swap', label: '💱 DeFi Swap', type: 'output' },
  ];

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } }, eds)), []);

  const onDragStart = (event, nodeType, isAction) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('isAction', isAction);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const isAction = event.dataTransfer.getData('isAction') === 'true';
      const position = { x: event.clientX - 250, y: event.clientY };
      let newNode;
      
      if (isAction) {
        const action = actionList.find(a => a.id === type);
        newNode = {
          id: `${type}-${nodes.length + 1}`,
          type: action.type,
          position,
          data: { label: action.label },
          style: { color: 'black' },
        };
      } else {
        newNode = {
          id: `${type}-${nodes.length + 1}`,
          type: 'default',
          position,
          data: { label: `${type} agent` },
          style: { color: 'black' },
        };
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, setNodes, actionList]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onKeyDown = useCallback((event) => {
    if (event.key === 'Delete') {
      setNodes((nds) => nds.filter((node) => !node.selected));
      setEdges((eds) => eds.filter((edge) => !edge.selected));
    }
  }, [setNodes, setEdges]);

  const handleCreateAgent = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewAgent({ name: '', desc: '', prompt: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAgent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAgents(prev => [...prev, newAgent]);
    handleCloseModal();
  };

  return (
    <main className={`${styles.main} ${styles.matrixBackground}`}>
      {!wallet ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', position: 'relative', zIndex: 1 }}>
            <Image src={Logo} alt="Nostra" width={500} height={500} />
          </div>
          <h2 style={{ color: 'black', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '2px', position: 'relative', zIndex: 1 }}>NOSTRA</h2>
          <div className={styles.matrixAnimation}></div>
        </>
      ) : (
        <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
          <div style={{
            width: '200px',
            padding: '20px',
            backgroundColor: '#f0f0f0',
            borderRight: '1px solid #ccc',
            overflowY: 'auto',
            color: 'black',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3>Actions</h3>
              {actionList.map((action) => (
                <div
                  key={action.id}
                  draggable
                  onDragStart={(event) => onDragStart(event, action.id, true)}
                  style={{ 
                    margin: '10px 0',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    cursor: 'move'
                  }}
                >
                  {action.label}
                </div>
              ))}
              <h3>Agents</h3>
              {agents.map((agent, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(event) => onDragStart(event, agent.name, false)}
                  style={{ 
                    margin: '10px 0',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    cursor: 'move'
                  }}
                >
                  {agent.name}
                </div>
              ))}
            </div>
            <button
              onClick={handleCreateAgent}
              style={{
                padding: '10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Create Agent
            </button>
          </div>
          <div style={{ flex: 1, position: 'relative' }} onKeyDown={onKeyDown} tabIndex={0}>
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
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <Controls />
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </div>
          {selectedNode && (
            <div style={{
              width: '250px',
              padding: '20px',
              backgroundColor: '#f0f0f0',
              borderLeft: '1px solid #ccc',
              overflowY: 'auto',
              color: 'black'
            }}>
              <h3>Node Details</h3>
              <p>ID: {selectedNode.id}</p>
              <p>Type: {selectedNode.type}</p>
              <p>Label: {selectedNode.data.label}</p>
            </div>
          )}
          {isModalOpen && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '5px',
                width: '300px'
              }}>
                <h2 style={{ color: 'black', textAlign: 'center' }}>Create Agent</h2>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <Image src={Logo} alt="Nostra" width={100} height={100} />
                </div>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="name" style={{ color: 'black' }}>Name:</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newAgent.name}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '5px', backgroundColor: 'white' }}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="desc" style={{ color: 'black' }}>Description:</label>
                    <textarea
                      id="desc"
                      name="desc"
                      value={newAgent.desc}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '5px', backgroundColor: 'white' }}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="prompt" style={{ color: 'black' }}>Prompt:</label>
                    <textarea
                      id="prompt"
                      name="prompt"
                      value={newAgent.prompt}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '5px', backgroundColor: 'white' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button type="submit" style={{ padding: '5px 10px' }}>Create</button>
                    <button type="button" onClick={handleCloseModal} style={{ padding: '5px 10px' }}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}