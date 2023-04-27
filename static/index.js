function buildTree(data, domain = "") {
  const tree = {
    name: domain,
    isRoot: true,
    children: [],
  };
  const trees = new Map();
  for (const [subdomain, url] of data) {
    if (!trees.has(subdomain)) {
      trees.set(subdomain, {
        name: subdomain,
        children: [],
      });
    }
    let t = trees.get(subdomain);
    for (const part of url.replace(/^\/+|\/+$/g, "").split(/\/+/).map((x) => `/${x}`)) {
      let found = false;
      for (const child of t.children) {
        if (child.name === part) {
          t = child;
          found = true;
          break;
        }
      }
      if (!found) {
        const newChild = { name: part, children: [] };
        t.children.push(newChild);
        t = newChild;
      }
    }
  }
  for (const [subdomain, t] of trees) {
    if (subdomain === "") {
      tree.children.push(t);
    } else {
      tree.children.push({
        name: `${subdomain}.${domain}`,
        children: [t],
      });
    }
  }
  return tree;
}

function treesByOrigin(data) {
  const grouped = new Map();
  for (const url of data) {
    const { origin, pathname } = new URL(url);
    const domain = origin.replace(/^https?:\/\/([^\.]+\.)?/, "");
    const subdomain = origin.replace(/^https?:\/\//, "").replace(domain, "").replace(/\.$/, "");
    console.log({ domain, subdomain });
    if (!grouped.has(domain)) {
      grouped.set(domain, []);
    }
    grouped.get(domain).push([subdomain, pathname]);
  }
  const trees = [...grouped.entries()]
    .map(([domain, urls]) => buildTree(urls, domain));
  return trees;
}

window.addEventListener("load", () => {

  const urls = window.data.flatMap((asset => asset.dirinfo
    .map((x) => `${asset.domain}/${x.path}`)
    .concat(asset.dirmap.map((x) => x.path))));
  const trees = treesByOrigin(urls);
  for (const tree of trees) {
    const chart = Tree(tree, {
      label: (d) => d.name,
      r: () => 5,
      fill: () => "#199ed8",
      parentNodeFill: () => "#075c8d",
      click(d, data, e, ev) {
        if (ev.target.tagName === "text") {
          e.preventDefault();
        }
      }
    });
    chart.classList.add("p-2");
    document.getElementById("d3").appendChild(chart);
  }
});