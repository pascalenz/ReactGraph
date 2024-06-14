import * as d3 from "d3";
import { GraphClickTarget, GraphLink, GraphNode } from "./Common.js";
import GraphEvents from "./GraphEvents.js";

// Based on: https://github.com/eisman/neo4jd3

export default class GraphNodeHandler {

    private readonly nodeRadius = 17;
    private readonly ringRadius = 21;

    private nodes: d3.Selection<d3.BaseType, GraphNode, SVGGElement, GraphNode>;

    constructor(
        private readonly container: d3.Selection<SVGGElement, unknown, null, undefined>,
        private readonly simulation: d3.Simulation<GraphNode, GraphLink>) { }

    public updateNodes(nodes: GraphNode[]): void {
        this.simulation.nodes(nodes);

        this.nodes = this.container
            .selectAll<d3.BaseType, GraphNode>(".node")
            .data(nodes, d => d.id)
            .join(
                enter => this.appendNodesToGraph(enter),
                update => this.updateNodesInGraph(update),
                exit => this.removeNodesFromGraph(exit));
    }

    private appendNodesToGraph(enter: d3.Selection<d3.EnterElement, GraphNode, SVGGElement, GraphNode>) {
        const group = enter
            .append("g")
            .attr("class", d => "node " + (d.cssClasses?.join(" ") ?? ""))
            .on("click", (e, d) => this.onClick(e, d))
            .on("dblclick", (e, d) => GraphEvents.publishNodeClickEvent(d, true, GraphClickTarget.Center))
            .on("mouseenter", (e, d) => this.onMouseEnter(e, d))
            .on("mouseleave", (e, d) => this.onMouseLeave(e, d))
            .call(d3.drag<SVGGElement, GraphNode>()
                .on("start", (e, d) => this.onDragStart(e, d))
                .on("drag", (e, d) => this.onDrag(e, d))
                .on("end", (e, d) => this.onDragEnd(e, d)));

        group.append("circle")
            .attr("class", "ring")
            .attr("r", this.ringRadius);

        group.append("circle")
            .attr("class", d => d.fx ? "outline fixed" : "outline")
            .attr("r", this.nodeRadius)
            .append("title")
                .text(d => d.details);

        group.append("text")
            .attr("class", "text fas")
            .attr("font-size", "9px")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .attr("y", "-4px")
            .html(d => `&#x${d.icon};`);

        group.append("text")
            .attr("class", "text")
            .attr("font-size", "6px")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .attr("y", d => this.wrapAndTruncateText(d.label, 11).length > 1 ? "4px" : "7px")
            .html(d => this.wrapAndTruncateText(d.label, 11)[0]);

        group.append("text")
            .attr("class", "text")
            .attr("font-size", "6px")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .attr("y", "11px")
            .html(d => this.wrapAndTruncateText(d.label, 11).length > 1 ? this.wrapAndTruncateText(d.label, 11)[1] : "");

        return group;
    }

    private updateNodesInGraph(update: d3.Selection<d3.BaseType, GraphNode, SVGGElement, GraphNode>) {
        return update.attr("class", d => "node " + (d.cssClasses?.join(" ") ?? ""));
    }

    private removeNodesFromGraph(exit: d3.Selection<d3.BaseType, GraphNode, SVGGElement, unknown>) {
        return exit.remove();
    }

    public tickNodes() {
        this.nodes?.attr("transform", d => `translate(${d.x}, ${d.y})`);
    }

    private onDragStart(event: d3.D3DragEvent<any, any, any>, d: GraphNode) {
        const element = event.sourceEvent.target as HTMLElement;
        if (!element.classList.contains("outline"))
            return;

        if (!event.active)
            this.simulation.alphaTarget(0.3).restart();

        element.classList.add("fixed");

        d.fx = event.x;
        d.fy = event.y;
    }

    private onDrag(event: d3.D3DragEvent<any, any, any>, d: GraphNode) {
        if (!d.fx && !d.fy)
            return;

        d.fx = event.x;
        d.fy = event.y;
    }

    private onDragEnd(event: d3.D3DragEvent<any, any, any>, d: GraphNode) {
        if (!event.active)
            this.simulation.alphaTarget(0);

        if (!d.fx && !d.fy)
            return;

        d.fx = d.x;
        d.fy = d.y;
    }

    private onClick(event: Event, d: GraphNode) {
        const element = event.target as HTMLElement;
        element.classList.remove("fixed");

        d.fx = null;
        d.fy = null;

        GraphEvents.publishNodeClickEvent(d, false, GraphClickTarget.Center);        
    }

    private onMouseEnter(event: Event, d: GraphNode) {
        this.addBrowseAction(event.target as HTMLElement, d, 0, "Expand Up", GraphClickTarget.Up);
        this.addBrowseAction(event.target as HTMLElement, d, 180, "Expand Down", GraphClickTarget.Down);
        this.addBrowseAction(event.target as HTMLElement, d, 90, "Expand Right", GraphClickTarget.Right);
        this.addBrowseAction(event.target as HTMLElement, d, 270, "Expand Left", GraphClickTarget.Left);
    }

    private onMouseLeave(event: Event, d: GraphNode) {
        this.removeActions(event.target as HTMLElement);
    }

    private addBrowseAction(element: HTMLElement, node: GraphNode, position: number, text: string, clickTarget: GraphClickTarget) {
        const disabled = !node.supportedClickTargets.includes(clickTarget);

        // Slightly offset the center of the arc so that the line between two args looks more straight.
        const centerOffset = { x: 0, y: 0 };
        if (position == 0) centerOffset.y = -1;
        if (position == 90) centerOffset.x = 1;
        if (position == 180) centerOffset.y = 1;
        if (position == 270) centerOffset.x = -1;

        let icon = "";
        if (position == 0) icon = "f0d8";
        if (position == 90) icon = "f0da";
        if (position == 180) icon = "f0d7";
        if (position == 270) icon = "f0d9";

        d3.select(element).insert("path", ".outline")
            .attr("class", `action ${disabled ? "disabled" : ""}`)
            .on("click", (e: Event, d: GraphNode) => {
                e.stopPropagation();
                GraphEvents.publishNodeClickEvent(d, false, clickTarget);
            })
            .on("dblclick", (e: Event, d: GraphNode) => {
                e.stopPropagation();
                GraphEvents.publishNodeClickEvent(d, true, clickTarget);
            })
            .attr("d", this.describeArcPath(centerOffset.x / 2, centerOffset.y / 2, this.ringRadius, position - 44.75, position + 44.75))
            .append("title")
                .text(() => text);

        d3.select(element).append("text")
            .attr("class", `action-icon fas ${disabled ? "disabled" : ""}`)
            .attr("font-size", "13px")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .attr("x", (centerOffset.x * 22).toString() + "px")
            .attr("y", (centerOffset.y * 22).toString() + "px")
            .attr("transform", `translate(0, 4.4)`)
            .html(`&#x${icon};`);
    }

    private removeActions(element: HTMLElement) {
        d3.select(element).selectAll(".action").remove();
        d3.select(element).selectAll(".action-icon").remove();
    }

    private describeArcPath(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
        const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
            const ar = (angleInDegrees - 90) * Math.PI / 180.0;
            return { x: centerX + (radius * Math.cos(ar)), y: centerY + (radius * Math.sin(ar)) };
        }
    
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
    }

    private wrapAndTruncateText(str: string, maxWidth: number): string[] {
        const regex = new RegExp(/\s*-\s*/g);
        const res: string[] = [];
        while (str.length > maxWidth) {                 
            let found = false;

            for (let i = maxWidth - 1; i >= 0; i--) {
                if (regex.test(str.charAt(i).charAt(0))) {
                    res.push(str.slice(0, i));
                    str = str.slice(i + 1);
                    found = true;
                    break;
                }
            }

            if (!found) {
                res.push(str.slice(0, maxWidth));
                str = str.slice(maxWidth);
            }        
        }
    
        res.push(str);
        return res;
    }    
}
