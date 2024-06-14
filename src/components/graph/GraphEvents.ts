import { GraphClickTarget, GraphLink, GraphLinkClickEvent, GraphNode, GraphNodeClickEvent } from "./Common.js";

export default class GraphEvents {
    private static linkClickEventType = "graph-link-click"; 
    private static nodeClickEventType = "graph-node-click"; 

    public static publishLinkClickEvent(link: GraphLink, isDoubleClick: boolean) {
        const detail: GraphLinkClickEvent = { link, isDoubleClick };
        window.dispatchEvent(new CustomEvent(this.linkClickEventType, { detail }));
    }

    public static publishNodeClickEvent(node: GraphNode, isDoubleClick: boolean, clickTarget: GraphClickTarget) {
        if (node.supportedClickTargets.includes(clickTarget)) {
            const detail: GraphNodeClickEvent = { node, isDoubleClick, clickTarget };
            window.dispatchEvent(new CustomEvent(this.nodeClickEventType, { detail }));
        }
    }

    public static subscribeToLinkClickEvents(handler: (data: GraphLinkClickEvent) => void) {
        const handleEvent = (event: CustomEvent<GraphLinkClickEvent>) => handler(event.detail);
        window.addEventListener(this.linkClickEventType, handleEvent, false);
        return () => window.removeEventListener(this.linkClickEventType, handleEvent, false);
    }

    public static subscribeToNodeClickEvents(handler: (data: GraphNodeClickEvent) => void) {
        const handleEvent = (event: CustomEvent<GraphNodeClickEvent>) => handler(event.detail);
        window.addEventListener(this.nodeClickEventType, handleEvent, false);
        return () => window.removeEventListener(this.nodeClickEventType, handleEvent, false);
    }
}
