import { DependencyList, useEffect, useState } from "react";
import { GraphData, GraphLinkClickEvent, GraphNodeClickEvent } from "../components/graph/Common.js";
import GraphEvents from "../components/graph/GraphEvents.js";
import GraphSimulationHandler from "../components/graph/GraphSimulationHandler.js";

export function useGraphLinkClickEvents(eventHandler: (data: GraphLinkClickEvent) => void, deps?: DependencyList) {
	useEffect(() => GraphEvents.subscribeToLinkClickEvents(eventHandler), deps);
}

export function useGraphNodeClickEvents(eventHandler: (data: GraphNodeClickEvent) => void, deps?: DependencyList) {
	useEffect(() => GraphEvents.subscribeToNodeClickEvents(eventHandler), deps);
}

export function useGraphSimulation(element: SVGSVGElement, graphData?: GraphData, deps?: DependencyList) {
    const [simulationHandler, setSimulationHandler] = useState<GraphSimulationHandler>();

    useEffect(() => {
        if (graphData) {
            if (!simulationHandler)
                setSimulationHandler(new GraphSimulationHandler(element, graphData));
            else
                simulationHandler.update(graphData);
        }
    }, [graphData, deps]);
}
