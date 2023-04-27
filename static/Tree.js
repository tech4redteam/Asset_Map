function Tree(data, {
  tree = d3.tree, 
  label, 
  width, 
  height, 
  r = () => 3, 
  fill = () => "#999", 
  parentNodeFill = () => "#555", 
  fillOpacity = 1, 
  stroke = () => "#555", 
  strokeWidth = 1.5, 
  strokeOpacity = 0.4, 
  strokeLinejoin, 
  strokeLinecap, 
  curve = d3.curveBumpX, 
  click = () => {}, 
  diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x),
  margin = {
    top: 10,
    right: 120,
    bottom: 10,
    left: 150,
  },
  dx = 30,
}) {
  const root = d3.hierarchy(data);

  const dy = (width ?? 640) / 4;
  const maxWidth = root.height * dy + r() * 2 + margin.left + margin.right;
  width ??= maxWidth;

  tree = tree().nodeSize([dx, dy]);

  root.x0 = dy / 2;
  root.y0 = 0;
  root.descendants().forEach((d, i) => {
    d.id = i;
    d._children = d.children;
  });

  const svg = d3.create("svg")
      .attr("viewBox", [-margin.left, -margin.top, width, dx])
      .attr("width", width)
      .attr("height", height)
      .style("font", "10px sans-serif")
      .style("user-select", "none");
  const gLink = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", (d) => stroke(d?.data))
      .attr("stroke-opacity", strokeOpacity)
      .attr("stroke-width", strokeWidth)
      .attr("stroke-linejoin", strokeLinejoin)
      .attr("stroke-linecap", strokeLinecap);

  const gNode = svg.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

  function update(source) {
    const duration = d3.event && d3.event.altKey ? 2500 : 250;
    const nodes = root.descendants().reverse();
    const links = root.links();

    tree(root);

    let left = root;
    let right = root;
    root.eachBefore(node => {
      if (node.x < left.x) left = node;
      if (node.x > right.x) right = node;
    });

    const height = right.x - left.x + margin.top + margin.bottom;

    const transition = svg.transition()
        .duration(duration)
        .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
        .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

    const node = gNode.selectAll("g")
      .data(nodes, d => d.id);

    const nodeEnter = node.enter().append("g")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", (event, d) => {
          const e = new MouseEvent("click", event);
          click(d?.data, d, e, event);
          if (e.defaultPrevented) return;
          d.children = d.children ? null : d._children;
          update(d);
        });

    nodeEnter.append("circle")
        .attr("r", (d) => r(d?.data))
        .attr("fill", (d) => d._children ? parentNodeFill(d?.data) : fill(d?.data))
        .attr("stroke-width", 10);

    nodeEnter.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d._children ? -6 : 6)
        .attr("text-anchor", d => d._children ? "end" : "start")
        .text(d => label(d?.data))
      .clone(true).lower()
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .attr("stroke", "white");

    const nodeUpdate = node.merge(nodeEnter).transition(transition)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .attr("fill-opacity", fillOpacity)
        .attr("stroke-opacity", 1);

    const nodeExit = node.exit().transition(transition).remove()
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

    const link = gLink.selectAll("path")
      .data(links, d => d.target.id);

    const linkEnter = link.enter().append("path")
        .attr("d", d => {
          const o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        });

    link.merge(linkEnter).transition(transition)
        .attr("d", diagonal);

    link.exit().transition(transition).remove()
        .attr("d", d => {
          const o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        });

    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  update(root);

  return svg.node();
}
