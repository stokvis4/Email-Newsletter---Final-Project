

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
};

var stringurl;

function callTree(s){
  stringurl = s;
  c2(0);
}

function c2(e){
  console.log(stringurl);
  // window.location.reload();
  url = stringurl;
  
  d3.json(url, function(error, treeData) {
    if (error) throw error;
    root = d3.hierarchy(treeData, function(d) { return d.children; });
    root.x0 = height / 2;
    root.y0 = 0;

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }
    if (e>0) {
      root.children.forEach(collapse);
      expandAll()
    }
    else if(e<0){
      root.children.forEach(collapse);
      collapseAll()
    }
    else {
      root.children.forEach(collapse);
      update(root);
    }
    function count(d,l){   
      var children = (d.children)?d.children:d._children;
      

      if (children) {
        var c = children.length;
        v = children.length;
        if (l>0) {
      //   console.log(children.length)
      //   // count(children,l)
      //   v = children.length
      //   for (ii=0;ii<v;ii++) {
       console.log("here");
      //   }
      //   return 0;
    }


    b = 0
    var v = children.length;
    var ml = [l]
    for (var i=0;i<v;i++) {
            // b += 1
            // console.log('First Loop');
            // if (children){
            //   b +=1
            var a = count(children[i],l+1);
            c += a[0];
            ml.push(a[1]);
              // }
            // console.log(children[i],l+1);
            // console.log('v is ' + v);





          };

          return [c,Math.max.apply(Math, ml),v];



        }
        return [0,l,0];
      };    

      function expand(d){   
        var children = (d.children)?d.children:d._children;
        if (d._children) {        
          d.children = d._children;
          d._children = null;       
        }
        if(children)
          children.forEach(expand);
      };

      function expandAll(){
        expand(root); 
        update(root);
      };

      function collapseAll(){
        root.children.forEach(collapse);
        collapse(root);
        update(root);
      };

      var tr = count(root,1);
      console.log(tr);
      var elem = document.getElementById('directchildren');
      elem.innerHTML = tr[2]
      var elem = document.getElementById('indirectchildren');
      elem.innerHTML = tr[0] - tr[2]
      var elem = document.getElementById('networkdepth');
      elem.innerHTML = tr[1] -1
      var elem = document.getElementById('compscore');
      elem.innerHTML = (tr[2] + (((.5*(tr[1]-1)*(tr[0]-tr[2]))))).toFixed(2)


    });
  var treemap = d3.tree().size([height, width]);

  
  function update(source) {

    // Assigns the x and y position for the nodes
    var treeData = treemap(root);

    // Compute the new tree layout.
    var nodes = treeData.descendants(),
    links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function(d){ d.y = d.depth * 325});

    // ****************** Nodes section ***************************

    // Update the nodes...
    var node = svg.selectAll('g.node')
    .data(nodes, function(d) {return d.id || (d.id = ++i); });

    // Enter any new modes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
    .attr('class', 'node')
    .attr("transform", function(d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on('click', click);

    // Add Circle for the nodes
    nodeEnter.append('circle')
    .attr('class', 'node')
    .attr('r', 1e-6)
    .style("fill", function(d) {
      return d._children ? "lightsteelblue" : "#fff";
    });

    // Add labels for the nodes
    nodeEnter.append('text')
    .attr("dy", ".35em")
    .attr("x", function(d) {
      return d.children || d._children ? -13 : 13;
    })
    .attr("text-anchor", function(d) {
      return d.children || d._children ? "end" : "start";
    })
    .text(function(d) { return d.data.id; });

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) { 
      return "translate(" + d.y + "," + d.x + ")";
    });

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
      return d._children ? "lightsteelblue" : "#fff";
    })
    .attr('cursor', 'pointer');


    // Remove any exiting nodes
    var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
    .attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
    .style('fill-opacity', 1e-6);

    // ****************** links section ***************************

    // Update the links...
    var link = svg.selectAll('path.link')
    .data(links, function(d) { return d.id; });

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
    .attr("class", "link")
    .attr('d', function(d){
      var o = {x: source.x0, y: source.y0}
      return diagonal(o, o)
    });

    // UPDATE
    var linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
    .duration(duration)
    .attr('d', function(d){ return diagonal(d, d.parent) });

    // Remove any exiting links
    var linkExit = link.exit().transition()
    .duration(duration)
    .attr('d', function(d) {
      var o = {x: source.x, y: source.y}
      return diagonal(o, o)
    })
    .remove();

    // Store the old positions for transition.
    nodes.forEach(function(d){
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {

      path = `M ${s.y} ${s.x}
      C ${(s.y + d.y) / 2} ${s.x},
      ${(s.y + d.y) / 2} ${d.x},
      ${d.y} ${d.x}`

      return path
    }

    // Toggle children on click.
    function click(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    }
  }

};


function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
};

