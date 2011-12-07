(function(){

  /**
   * Baseline setup (modeled after Underscore JS)
   */
  var root = this,
      previous_Conceptual = root.Conceptual,
      Conceptual = {};

  var array_to_obj = function(array){
    var obj = {};
    array.forEach(function(el){
      obj[el.name] = el.value;
    });
    return obj;
  }

  var Node = Backbone.Model.extend({
    defaults : {
      name : 'name',
      id : _.uniqueId()
    },
    initialize : function(){
      _.bindAll(this, 'asD3Node');
    },
    asD3Node : function(){
      return { name : this.get('name'), group : 1 };
    }
  });
  var empty_node = new Node({name : 'empty'});

  var Concept = Backbone.Model.extend({
    defaults : {
      subject : empty_node,
      predicate : empty_node,
      object : empty_node
    },
    initialize : function(){
      _.bindAll(this, 'getD3Nodes', 'getD3Links');
    },
    getD3Nodes : function(){
    },
    getD3Links : function(){
    }
  });

  var ConceptMap = Backbone.Collection.extend({
    model : Concept,

    initialize : function(){
      _.bindAll(this, 'asNodesAndLinks');
    },

    asNodesAndLinks : function(){
      var nodes = [],
          links = [];
      this.forEach(function(concept){
        var subject_index = nodes.push(concept.get('subject').asD3Node())-1,
            predicate_index = nodes.push(concept.get('predicate').asD3Node())-1,
            object_index = nodes.push(concept.get('object').asD3Node())-1;
        links.push({
          "source":subject_index,
          "target":predicate_index,
          "value" : 1
        });
        links.push({
          "source":predicate_index,
          "target":object_index,
          "value" : 1
        });
      });
      return { 'nodes' : nodes, 'links' : links};
    }
  });

  var ConceptView = Backbone.View.extend({
    tagName : 'p',

    initialize : function(){
      _.bindAll(this, 'render', 'unrender', 'remove');
      this.model.bind('change', this.render);
      this.model.bind('remove', this.unrender);
    },

    render : function(){
      $(this.el).html(
        this.model.get('subject') + "-->" +
        this.model.get('predicate') + "-->" +
        this.model.get('object')
      );
      return this;
    },

    unrender : function(){
      $(this.el).remove();
    },

    remove : function(){
      this.model.destroy();
    }
  });

  var ConceptMapView = Backbone.View.extend({
    el : $('#main'),

    events : {
      "submit form#new_concept" : "addConcept"
    },

    initialize : function(){
      _.bindAll(this, 'render', 'addConcept', 'appendConcept');

      this.collection = new ConceptMap();
      this.collection.bind('add', this.appendConcept);

      this.render();
    },

    render : function(){
      $(this.el).append("<p>Hey look, things!</p>");
      $(this.el).append('<form id="new_concept"><input name="subject" value="subject" /><input name="predicate" value="predicate" /><input name="object" value="object" /><input type="submit" id="add" value="Add" /></form>');
      _(this.collection.models).each(function(concept){
        appendConcept(concept);
      }, this);
    },

    addConcept : function(){
      var concept = new Concept(),
          form = array_to_obj($("#new_concept").serializeArray());
      concept.set({
        subject : form.subject,
        predicate : form.predicate,
        object : form.object
      });
      this.collection.add(concept);
      return false;
    },

    appendConcept : function(concept){
      var conceptView = new ConceptView({
        model : concept
      });
      $(this.el).append(conceptView.render().el);
    }
  });

  conceptmapview = new ConceptMapView();

  root.Conceptual = {
    "Node" : Node,
    "Concept" : Concept,
    "ConceptMap" : ConceptMap
  }
// Testing Code /*************************************************
  var sub = new Node({name:"bob"});
  var ob = new Node({name:"chicken"});
  var pred = new Node({name:"likes"});
  var con = new Concept({subject:sub, object:ob, predicate:pred});
  var con2 = new Concept({subject:sub, object:ob, predicate:pred});
  var cmap = new ConceptMap();
  cmap.add(con);
  cmap.add(con2);
  var json = cmap.asNodesAndLinks();

  var w = 960,
    h = 500

  var vis = d3.select("#chart").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

  var force = self.force = d3.layout.force()
    .nodes(json.nodes)
    .links(json.links)
    .gravity(.05)
    .distance(100)
    .charge(-100)
    .size([w, h])
    .start();

  var link = vis.selectAll("line.link")
    .data(json.links)
    .enter().append("svg:line")
    .attr("class", "link")
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  var node = vis.selectAll("g.node")
    .data(json.nodes)
    .enter().append("svg:g")
    .attr("class", "node")
    .call(force.drag);

  node.append("svg:image")
    .attr("class", "circle")
    .attr("xlink:href", "https://d3nwyuy0nl342s.cloudfront.net/images/icons/public.png")
    .attr("x", "-8px")
    .attr("y", "-8px")
    .attr("width", "16px")
    .attr("height", "16px");

  node.append("svg:text")
    .attr("class", "nodetext")
    .attr("dx", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.name });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
})(jQuery);
