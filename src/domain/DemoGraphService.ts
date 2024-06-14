import DemoGraphLink from "./DemoGraphLink.js";
import DemoGraphNode from "./DemoGraphNode.js";

export default class DemoGraphService {
    constructor() {
        this.clear();
    }

    private nodeCounter = 1;
    private linkCounter = 1;

    public nodes: Record<string, DemoGraphNode>;
    public links: Record<string, DemoGraphLink>;

    public insertStartNode() {
        const node = new DemoGraphNode(this.nodeCounter++);
        node.setDefaultPosition();
        this.nodes[node.id] = node;
    }

    public insertRelatedNodes(relativeTo: DemoGraphNode, offsetX: number, offsetY: number) {
        for (let i = 0; i < 3; i++) {
            const node = new DemoGraphNode(this.nodeCounter++);
            node.setRelativePosition(relativeTo, offsetX + (i * 10), offsetY + (i * 10));
            this.nodes[node.id] = node;

            const link = new DemoGraphLink(this.linkCounter++, () => this.nodes[relativeTo.id], () => this.nodes[node.id]);
            this.links[link.id] = link;
        }
    }

    public removeNode(node: DemoGraphNode) {
        delete this.nodes[node.id];
        this.removeBrokenLinks();
    }

    public clear(keepPinned?: boolean) {
        if (keepPinned) {
            Object.keys(this.nodes).filter(id => !this.nodes[id].isPinned).forEach(id => delete this.nodes[id]);
            this.removeBrokenLinks();
        } else {
            this.nodes = {};
            this.links = {};    
        }

        if (Object.values(this.nodes).length == 0)
            this.insertStartNode();
    }

    private removeBrokenLinks() {
        const brokenLinks = Object.keys(this.links).filter(id => !this.links[id].source || !this.links[id].target);
        brokenLinks.forEach(id => delete this.links[id]);
    }
}
