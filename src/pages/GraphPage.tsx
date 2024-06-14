import React, { useEffect, useRef, useState } from "react";
import { GraphClickTarget, GraphData } from "../components/graph/Common.js";
import { useGraphNodeClickEvents, useGraphSimulation } from "../hooks/GraphHooks.js";
import DemoGraphService from "../domain/DemoGraphService.js";
import DemoGraphNode from "../domain/DemoGraphNode.js";

export default function GraphPage() {

    const element = useRef<SVGSVGElement>(null);

    const [graphService, setGraphService] = useState<DemoGraphService>();
    const [graphData, setGraphData] = useState<GraphData>();
    
    const updateGraph = () => setGraphData({
        nodes: Object.values(graphService?.nodes ?? {}),
        links: Object.values(graphService?.links ?? {})
    });

    const clearGraph = (keepPinnedNodes: boolean) => {
        graphService?.clear(keepPinnedNodes);
        updateGraph();
    }

    useGraphSimulation(element.current!, graphData);

    useGraphNodeClickEvents(event => {
        switch (event.clickTarget) {
            case GraphClickTarget.Up:
                graphService?.insertRelatedNodes(event.node as DemoGraphNode, 0, -50);
                updateGraph();
                break;
            case GraphClickTarget.Down:
                graphService?.insertRelatedNodes(event.node as DemoGraphNode, 0, 50);
                updateGraph();
                break;
            case GraphClickTarget.Left:
                graphService?.insertRelatedNodes(event.node as DemoGraphNode, -50, 0);
                updateGraph();
                break;
            case GraphClickTarget.Right:
                graphService?.insertRelatedNodes(event.node as DemoGraphNode, 50, 0);
                updateGraph();
                break;
        }
    }, [graphData]);

    useEffect(() => { updateGraph(); }, [graphService]);

    useEffect(() => { setGraphService(new DemoGraphService()); }, []);

    return <>
        <div>
            <button onClick={() => clearGraph(false)}>Remove all nodes</button>
            <button onClick={() => clearGraph(true)}>Remove unpinned nodes</button>
        </div>
        <svg ref={element} key="graph-presenter" />
    </>
};
