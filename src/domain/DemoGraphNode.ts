import { GraphClickTarget, GraphNode } from "../components/graph/Common.js";

export default class DemoGraphNode implements GraphNode {

    private icons = ["f0f3", "f013", "f15c", "f0e0", "f015", "f279", "f1e6", "f12e", "f3ed", "f5bf", "f0f2", "f0ce", "f02b", "f7d9", "f007"];
    private classes = ["fill-info", "fill-success", "fill-warning", "fill-danger"];

    constructor(counter: number) {
        this.id = counter.toString();
        this.icon = this.icons[counter % this.icons.length];
        this.label = `Node ${counter}`;
        this.details = `This is node ${counter}.`;
        this.supportedClickTargets = [GraphClickTarget.Down, GraphClickTarget.Up, GraphClickTarget.Left, GraphClickTarget.Right];
        this.cssClasses = [this.classes[counter % this.classes.length]];
    }

    public index?: number;
    public x?: number;
    public y?: number;
    public vx?: number;
    public vy?: number;
    public fx?: number|null;
    public fy?: number|null;
    public id: string;
    public icon: string;
    public label: string;
    public details: string;
    public supportedClickTargets: GraphClickTarget[];
    public cssClasses?: string[];

    public get isPinned() { return !!this.fx || !!this.fy; }
    
    public set isPinned(value: boolean) {
        this.fx = value ? this.x : null;
        this.fy = value ? this.y : null;
    }

    public setDefaultPosition() {
        this.x = this.getDefaultX();
        this.y = this.getDefaultY();
    }

    public setRelativePosition(node: DemoGraphNode, offsetX: number, offsetY: number) {
        this.x = (node.x ?? this.getDefaultX()) + offsetX;
        this.y = (node.y ?? this.getDefaultY()) + offsetY;
    }

    private getDefaultX = () => window.innerWidth / 2;
    private getDefaultY = () => (window.innerHeight - 200) / 2;
}
