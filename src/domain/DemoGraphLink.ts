import { GraphLink } from "../components/graph/Common.js";
import DemoGraphNode from "./DemoGraphNode.js";

export default class DemoGraphLink implements GraphLink {

    private classes = ["info", "success", "warning", "danger"];

    constructor(counter: number, private sourceAccessor: () => DemoGraphNode, private targetAccessor: () => DemoGraphNode) {
        this.id = counter.toString();
        this.label = `Link ${counter}`;
        this.details = `This is link ${counter}.`;
        this.cssClasses = [this.classes[counter % this.classes.length]];
    }

    public index?: number;
    public id: string;
    public label: string;
    public details: string;
    public cssClasses?: string[];

    public get source() { return this.sourceAccessor(); }
    public get target() { return this.targetAccessor(); }
}
