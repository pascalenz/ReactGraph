export enum GraphClickTarget {
    Center,
    Up,
    Down,
    Left,
    Right
}

export interface GraphNode extends d3.SimulationNodeDatum {
    id: string,
    icon: string;
    label: string;
    details: string;
    supportedClickTargets: GraphClickTarget[];
    cssClasses?: string[];
}

export interface GraphNodeClickEvent {
    node: GraphNode;
    clickTarget: GraphClickTarget;
    isDoubleClick: boolean;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
    id: string,
    label?: string;
    details?: string;
    cssClasses?: string[];
}

export interface GraphLinkClickEvent {
    link: GraphLink;
    isDoubleClick: boolean;
}

export interface GraphData {
    nodes: GraphNode[],
    links: GraphLink[]
}
