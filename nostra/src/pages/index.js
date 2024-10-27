import Image from 'next/image';
import { useContext, useState, useCallback } from 'react';
import styles from '@/styles/app.module.css';
import Logo from '/public/nostra.png';
import { NearContext } from '@/wallets/near';
import { ReactFlow } from '@xyflow/react';
import { Controls, Background, addEdge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function Home() {
  const { signedAccountId, wallet } = useContext(NearContext);
  const [nodes, setNodes] = useState([
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
    { id: '2', position: { x: 100, y: 100 }, data: { label: 'Node 2' } },
  ]);
  const [edges, setEdges] = useState([
    { id: 'e1-2', source: '1', target: '2', animated: true, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  ]);
  const [sidebarContent, setSidebarContent] = useState(null);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } }, eds)), []);

  const onAdd = useCallback(() => {
    const newNode = {
      id: (nodes.length + 1).toString(),
      data: { label: `Node ${nodes.length + 1}` },
      position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes]);

  const onNodeClick = useCallback((event, node) => {
    setSidebarContent(`Node clicked: ${node.id}`);
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    setSidebarContent(`Edge clicked: ${edge.id}`);
  }, []);

  const onKeyDown = useCallback((event) => {
    if (event.key === 'Delete') {
      setNodes((nds) => nds.filter((node) => !node.selected));
      setEdges((eds) => eds.filter((edge) => !edge.selected));
    }
  }, []);

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
          <div style={{ flex: 1, position: 'relative' }} onKeyDown={onKeyDown} tabIndex={0}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              fitView
            >
              <Controls />
              <Background />
              <button
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 10,
                  zIndex: 4,
                }}
                onClick={onAdd}
              >
                Add Node
              </button>
            </ReactFlow>
          </div>
          {sidebarContent && (
            <div style={{
              width: '250px',
              padding: '20px',
              backgroundColor: '#f0f0f0',
              borderLeft: '1px solid #ccc',
              overflowY: 'auto'
            }}>
              <h3>Details</h3>
              <p>{sidebarContent}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}