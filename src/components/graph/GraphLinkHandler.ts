import * as d3 from "d3";
import { GraphLink, GraphNode } from "./Common.js";
import GraphEvents from "./GraphEvents.js";

// Based on: https://github.com/eisman/neo4jd3

export default class GraphLinkHandler {

    private readonly arrowSize = 4;
    private readonly nodeRadius = 17;

    private links: d3.Selection<d3.BaseType, GraphLink, SVGGElement, GraphLink>;

    constructor(
        private readonly container: d3.Selection<SVGGElement, unknown, null, undefined>,
        private readonly simulation: d3.Simulation<GraphNode, GraphLink>) { }

    public updateLinks(links: GraphLink[]): void {
        this.simulation.force<d3.ForceLink<GraphNode, GraphLink>>("link")!.links(links);

        this.links = this.container
            .selectAll<d3.BaseType, GraphLink>(".link")
            .data(links, d => d.id)
            .join(
                enter => this.appendLinksToGraph(enter),
                update => this.updateLinksInGraph(update),
                exit => this.removeLinksFromGraph(exit));
    }

    private appendLinksToGraph(enter: d3.Selection<d3.EnterElement, GraphLink, SVGGElement, GraphLink>) {
        const group = enter
            .append("g")
            .attr("class", d => "link " + (d.cssClasses?.join(" ") ?? ""))
            .on("click", (e, d) => GraphEvents.publishLinkClickEvent(d, false))
            .on("dblclick", (e, d) => GraphEvents.publishLinkClickEvent(d, true));

        group.filter(d => !!d.label).append("text")
            .attr("class", "text")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .text(d => d.label!);

        group.append("path")
            .attr("class", "outline");

        group.append("path")
            .attr("class", "overlay");

        return group;
    }

    private updateLinksInGraph(update: d3.Selection<d3.BaseType, GraphLink, SVGGElement, GraphLink>) {
        return update.attr("class", d => "link " + (d.cssClasses?.join(" ") ?? ""));
    }
    
    private removeLinksFromGraph(exit: d3.Selection<d3.BaseType, GraphLink, SVGGElement, unknown>) {
        return exit.remove();
    }

    public tickLinks() {
        if (this.links) {
            this.links.attr("transform", (d: any) => {
                const angle = this.rotation(d.source, d.target);
                return `translate(${d.source.x}, ${d.source.y}) rotate(${angle})`;
            });

            this.links.select(".text").attr("transform", (d: any) => {
                const angle = (this.rotation(d.source, d.target) + 360) % 360,
                    mirror = angle > 90 && angle < 270,
                    center = { x: 0, y: 0 },
                    n = this.unitaryNormalVector(d.source, d.target),
                    nWeight = mirror ? 2 : -3,
                    point = { x: (d.target.x - d.source.x) * 0.5 + n.x * nWeight, y: (d.target.y - d.source.y) * 0.5 + n.y * nWeight },
                    rotatedPoint = this.rotatePoint(center, point, angle);
    
                return `translate(${rotatedPoint.x}, ${rotatedPoint.y}) rotate(${mirror ? 180 : 0})`;
            });

            this.links.select(".overlay").attr("d", (d: any) => {
                const center = { x: 0, y: 0 },
                    angle = this.rotation(d.source, d.target),
                    n1 = this.unitaryNormalVector(d.source, d.target),
                    n = this.unitaryNormalVector(d.source, d.target, 50),
                    p1 = this.rotatePoint(center, { x: 0 - n.x, y: 0 - n.y }, angle),
                    p2 = this.rotatePoint(center, { x: d.target.x - d.source.x - n.x, y: d.target.y - d.source.y - n.y }, angle),
                    p3 = this.rotatePoint(center, { x: d.target.x - d.source.x + n.x - n1.x, y: d.target.y - d.source.y + n.y - n1.y }, angle),
                    p4 = this.rotatePoint(center, { x: 0 + n.x - n1.x, y: 0 + n.y - n1.y }, angle);
    
                return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;
            });

            this.tickLinkOutlines();
        }
    }

    private tickLinkOutlines() {
        const tick = (outline: any, text: any) => {
            outline.attr("d", (d: any) => {
                const center = { x: 0, y: 0 },
                    angle = this.rotation(d.source, d.target),
                    textBoundingBox = text.empty() ? { width: 0 } : text.node().getBBox(),
                    textPadding = text.empty() ? 0 : 5,
                    u = this.unitaryVector(d.source, d.target),
                    textMargin = { x: (d.target.x - d.source.x - (textBoundingBox.width + textPadding) * u.x) * 0.5, y: (d.target.y - d.source.y - (textBoundingBox.width + textPadding) * u.y) * 0.5 },
                    n = this.unitaryNormalVector(d.source, d.target),
                    rotatedPointA1 = this.rotatePoint(center, { x: 0 + (this.nodeRadius + 1) * u.x - n.x, y: 0 + (this.nodeRadius + 1) * u.y - n.y }, angle),
                    rotatedPointB1 = this.rotatePoint(center, { x: textMargin.x - n.x, y: textMargin.y - n.y }, angle),
                    rotatedPointC1 = this.rotatePoint(center, { x: textMargin.x, y: textMargin.y }, angle),
                    rotatedPointD1 = this.rotatePoint(center, { x: 0 + (this.nodeRadius + 1) * u.x, y: 0 + (this.nodeRadius + 1) * u.y }, angle),
                    rotatedPointA2 = this.rotatePoint(center, { x: d.target.x - d.source.x - textMargin.x - n.x, y: d.target.y - d.source.y - textMargin.y - n.y }, angle),
                    rotatedPointB2 = this.rotatePoint(center, { x: d.target.x - d.source.x - (this.nodeRadius + 1) * u.x - n.x - u.x * this.arrowSize, y: d.target.y - d.source.y - (this.nodeRadius + 1) * u.y - n.y - u.y * this.arrowSize }, angle),
                    rotatedPointC2 = this.rotatePoint(center, { x: d.target.x - d.source.x - (this.nodeRadius + 1) * u.x - n.x + (n.x - u.x) * this.arrowSize, y: d.target.y - d.source.y - (this.nodeRadius + 1) * u.y - n.y + (n.y - u.y) * this.arrowSize }, angle),
                    rotatedPointD2 = this.rotatePoint(center, { x: d.target.x - d.source.x - (this.nodeRadius + 1) * u.x, y: d.target.y - d.source.y - (this.nodeRadius + 1) * u.y }, angle),
                    rotatedPointE2 = this.rotatePoint(center, { x: d.target.x - d.source.x - (this.nodeRadius + 1) * u.x + (- n.x - u.x) * this.arrowSize, y: d.target.y - d.source.y - (this.nodeRadius + 1) * u.y + (- n.y - u.y) * this.arrowSize }, angle),
                    rotatedPointF2 = this.rotatePoint(center, { x: d.target.x - d.source.x - (this.nodeRadius + 1) * u.x - u.x * this.arrowSize, y: d.target.y - d.source.y - (this.nodeRadius + 1) * u.y - u.y * this.arrowSize }, angle),
                    rotatedPointG2 = this.rotatePoint(center, { x: d.target.x - d.source.x - textMargin.x, y: d.target.y - d.source.y - textMargin.y }, angle);

                return "M " + rotatedPointA1.x + " " + rotatedPointA1.y +
                       " L " + rotatedPointB1.x + " " + rotatedPointB1.y +
                       " L " + rotatedPointC1.x + " " + rotatedPointC1.y +
                       " L " + rotatedPointD1.x + " " + rotatedPointD1.y +
                       " Z M " + rotatedPointA2.x + " " + rotatedPointA2.y +
                       " L " + rotatedPointB2.x + " " + rotatedPointB2.y +
                       " L " + rotatedPointC2.x + " " + rotatedPointC2.y +
                       " L " + rotatedPointD2.x + " " + rotatedPointD2.y +
                       " L " + rotatedPointE2.x + " " + rotatedPointE2.y +
                       " L " + rotatedPointF2.x + " " + rotatedPointF2.y +
                       " L " + rotatedPointG2.x + " " + rotatedPointG2.y +
                       " Z";
            });
        };

        this.links.each(function(this: any) {
            const rel = d3.select(this);
            tick(rel.select(".outline"), rel.select(".text"));
        });
    }

    private unitaryNormalVector(source: GraphNode, target: GraphNode, newLength?: number) {
        return this.rotatePoint({ x: 0, y: 0 }, this.unitaryVector(source, target, newLength), 90);
    }

    private unitaryVector(source: GraphNode, target: GraphNode, newLength?: number) {
        const length = Math.sqrt(Math.pow(target.x! - source.x!, 2) + Math.pow(target.y! - source.y!, 2)) /
            Math.sqrt(newLength || 1);

        return {
            x: (target.x! - source.x!) / length,
            y: (target.y! - source.y!) / length,
        };
    }

    private rotatePoint(c: { x: number, y: number }, p: { x: number, y: number }, angle: number) {
        return this.rotate(c.x, c.y, p.x, p.y, angle);
    }

    private rotate(cx: number, cy: number, x: number, y: number, angle: number) {
        const radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;

        return { x: nx, y: ny };
    }

    private rotation(source: GraphNode, target: GraphNode) {
        return Math.atan2(target.y! - source.y!, target.x! - source.x!) * 180 / Math.PI;
    }
}
