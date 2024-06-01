"use client";

import styles from "./BuilderCanvas.module.css";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  SelectionMode,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import "./index.css";
import DatabaseNode from "./nodes/DatabaseNode";
import { useCallback, useEffect, useState } from "react";
import {
  sampleNeo4jConfig,
  samplePostgreSQLConfig,
} from "@/interface/database/sampleConfig";
import ServerNode from "./nodes/ServerNode";
import {
  sampleAxumConfig,
  sampleNestConfig,
} from "@/interface/server/sampleConfig";
import {
  sampleNextConfig,
  sampleReactConfig,
} from "@/interface/web/sampleConfig";
import WebNode from "./nodes/WebNode";
import StorageNode from "./nodes/StorageNode";
import DesktopNode from "./nodes/DesktopNode";
import MobileNode from "./nodes/MobileNode";
import image2 from "@/asset/images/image2.png";
import Image from "next/image";
import CreatorSection from "./creator/CreatorSection";

interface defaultNodeDataType {
  name: string;
}

const nodeTypes = {
  database: DatabaseNode,
  server: ServerNode,
  web: WebNode,
  storage: StorageNode,
  desktop: DesktopNode,
  mobile: MobileNode,
};

export default function BuilderCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [dragGuideVisible, setDragGuideVisible] = useState(false);
  const [dragGuidePosition, setDragGuidePosition] = useState({ x: 0, y: 0 });

  const { screenToFlowPosition, fitView } = useReactFlow();

  const onDragOver = useCallback(
    (event: any) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setDragGuidePosition(position);
      setDragGuideVisible(true);
    },
    [screenToFlowPosition, setDragGuidePosition, setDragGuideVisible]
  );

  const onDrop = useCallback(
    (event: any) => {
      setDragGuideVisible(false);
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: `node-${nodes.length + 1}`,
        type,
        position,
        data: { name: "New Node" + nodes.length },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, nodes]
  );

  const onConnect = (params: any) => {
    setEdges((edges) => [
      ...edges,
      {
        id: `edge-${edges.length}`,
        source: params.source,
        target: params.target,
        type: "straight",
      },
    ]);
  };

  return (
    <main className={styles.main}>
      <div className={styles.background}>
        <Image src={image2} alt="bg" />
      </div>
      <CreatorSection />
      <div className={styles.canvas}>
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          panOnScroll
          selectionOnDrag
          panOnDrag={[1, 2]}
          selectionMode={SelectionMode.Partial}
          snapToGrid
          snapGrid={[20, 20]}
          proOptions={{
            hideAttribution: true,
          }}
          fitView
          className="builder-flow"
        >
          <Background
            gap={20}
            variant={BackgroundVariant.Lines}
            lineWidth={0.4}
          />
          <Controls position="bottom-right" />
        </ReactFlow>
      </div>
    </main>
  );
}
