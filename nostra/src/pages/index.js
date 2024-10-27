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
    { id: '1', position: { x: 250, y: 0 }, data: { label: 'Node 1' } },
    { id: '2', position: { x: 350, y: 100 }, data: { label: 'Node 2' } },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: 'e1-2', source: '1', target: '2', animated: true, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  ]);
  const [selectedNode, setSelectedNode] = useState(null);

  const blockList = [
    { id: 'block1', label: 'Block 1' },
    { id: 'block2', label: 'Block 2' },
    { id: 'block3', label: 'Block 3' },
  ];

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } }, eds)), []);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
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
      const position = { x: event.clientX - 250, y: event.clientY };
      const newNode = {
        id: `${type}-${nodes.length + 1}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, setNodes]
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
            overflowY: 'auto'
          }}>
            <h3>Blocks</h3>
            {blockList.map((block) => (
              <div
                key={block.id}
                draggable
                onDragStart={(event) => onDragStart(event, block.id)}
                style={{ 
                  margin: '10px 0',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  cursor: 'move'
                }}
              >
                {block.label}
              </div>
            ))}
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
              overflowY: 'auto'
            }}>
              <h3>Node Details</h3>
              <p>ID: {selectedNode.id}</p>
              <p>Type: {selectedNode.type}</p>
              <p>Label: {selectedNode.data.label}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}