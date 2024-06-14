import * as d3 from "d3";
import { GraphData, GraphLink, GraphNode } from "./Common.js";
import GraphLinkHandler from "./GraphLinkHandler.js";
import GraphNodeHandler from "./GraphNodeHandler.js";

export default class GraphSimulationHandler {

    private readonly simulation: d3.Simulation<GraphNode, GraphLink>;
    private readonly linkHandler: GraphLinkHandler;
    private readonly nodeHandler: GraphNodeHandler;

    constructor(element: SVGSVGElement, graphData: GraphData) {

        element.classList.add("graph-presenter");

        const { width, height } = element.getBoundingClientRect();

        // Set up various forces. Some of them might need to be removed or fine-tuned
        // depending on the nature of the graph and persoal prefernces.
        this.simulation = d3.forceSimulation<GraphNode, GraphLink>()
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2)
                .strength(0.3))
            .force("link", d3.forceLink<GraphNode, GraphLink>()
                .strength(0.5)
                .distance(100)
                .iterations(1)
                .id(d => d.id))
            .force("collide", d3.forceCollide()
                .radius(25)
                .strength(1)
                .iterations(1));

        // Create containers for the links and nodes. Note that the container for
        // links must be rendered first so that links are behind nodes.
        const linksElement = d3.select(element).append("g").attr("class", "group");
        const nodesElement = d3.select(element).append("g").attr("class", "group");

        this.nodeHandler = new GraphNodeHandler(nodesElement, this.simulation);
        this.linkHandler = new GraphLinkHandler(linksElement, this.simulation);

        this.nodeHandler.updateNodes(graphData.nodes);
        this.linkHandler.updateLinks(graphData.links);

        this.simulation.on("tick", () => {
            this.nodeHandler.tickNodes();
            this.linkHandler.tickLinks();
        });

        const zoom = d3.zoom()
            .scaleExtent([.25, 10])
            .extent([[0, 0], [width, height]])
            .on("zoom", event => d3.select(element).selectAll(".group").attr("transform", event.transform));

        d3.select(element)
            .call(zoom)
            .on('dblclick.zoom', null);

        this.addZoomInButton(element, zoom);
        this.addZoomOutButton(element, zoom);
    }

    public update(graphData: GraphData) {
        // Links must be updated first. Otherwise we get errors when
        // clearing the workspace due to broken node refercnes.
        this.linkHandler.updateLinks(graphData.links);
        this.nodeHandler.updateNodes(graphData.nodes);
        this.simulation.alphaTarget(0.2).restart();
        setTimeout(() => this.simulation.alphaTarget(0).restart(), 500);
    }

    private addZoomInButton(element: SVGSVGElement, zoom: d3.ZoomBehavior<Element, unknown>) {
        d3.select(element)
            .append("rect")
            .attr("x", "calc(100% - 27px)")
            .attr("y", "4px")
            .attr("height", "22px")
            .attr("width", "22px")
            .attr("class", "zoom-button-background");

        d3.select(element).append("rect")
            .attr("x", "calc(100% - 22px)")
            .attr("y", "14px")
            .attr("height", "2px")
            .attr("width", "12px")
            .attr("class", "zoom-button-text");

        d3.select(element).append("rect")
            .attr("x", "calc(100% - 17px)")
            .attr("y", "9px")
            .attr("height", "12px")
            .attr("width", "2px")
            .attr("class", "zoom-button-text");

        d3.select(element).append("rect")
            .attr("x", "calc(100% - 27px)")
            .attr("y", "4px")
            .attr("height", "22px")
            .attr("width", "22px")
            .attr("class", "zoom-button-foreground")
            .on("click", () => d3.select(element).transition().call(zoom.scaleBy, 1.5));
    }

    private addZoomOutButton(element: SVGSVGElement, zoom: d3.ZoomBehavior<Element, unknown>) {
        d3.select(element)
            .append("rect")
            .attr("x", "calc(100% - 27px)")
            .attr("y", "28px")
            .attr("height", "22px")
            .attr("width", "22px")
            .attr("class", "zoom-button-background");

        d3.select(element).append("rect")
            .attr("x", "calc(100% - 22px)")
            .attr("y", "38px")
            .attr("height", "2px")
            .attr("width", "12px")
            .attr("class", "zoom-button-text");

        d3.select(element).append("rect")
            .attr("id", "zoom-out-button")
            .attr("x", "calc(100% - 27px)")
            .attr("y", "28px")
            .attr("height", "22px")
            .attr("width", "22px")
            .attr("class", "zoom-button-foreground")
            .on("click", () => d3.select(element).transition().call(zoom.scaleBy, 0.5));
    }
}
