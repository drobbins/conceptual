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
      _.bindAll(this, 'asNodesAndLinks', 'getNodeByName');
    },

    asNodesAndLinks : function(){
      var nodes = [],
          links = [],
          names = [];
      this.forEach(function(concept){
        var subject = concept.get('subject').asD3Node(),
            predicate = concept.get('predicate').asD3Node(),
            object = concept.get('object').asD3Node(),
            subject_index = names.indexOf(subject.name),
            predicate_index = names.indexOf(predicate.name),
            object_index = names.indexOf(object.name);
        if(subject_index === -1){
          names.push(subject.name);
          subject_index = nodes.push(concept.get('subject').asD3Node())-1;
        }
        if(predicate_index === -1){
          names.push(predicate.name);
          predicate_index = nodes.push(concept.get('predicate').asD3Node())-1;
        }
        if(object_index === -1){
          names.push(object.name);
          object_index = nodes.push(concept.get('object').asD3Node())-1;
        }
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
    },

    getNodeByName : function(name){
      var named_concept;
      this.forEach(function(concept){
        if( concept.get('subject').get('name') === name){
          named_concept = concept.get('subject');
        }
        if( concept.get('predicate').get('name') === name){
          named_concept = concept.get('predicate');
        }
        if( concept.get('object').get('name') === name){
          named_concept = concept.get('object');
        }
      });
      return named_concept;
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
      this.collection.bind('add', this.render);

      this.render();
    },

    render : function(){
      $("#chart").html("");
      $(this.el).html("");
      $(this.el).append('<form id="new_concept"><input name="subject" value="subject" /><input name="predicate" value="predicate" /><input name="object" value="object" /><input type="submit" id="add" value="Add" /></form>');
      var w = 960,
          h = 500,
          json = this.collection.asNodesAndLinks();

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

      node.append("svg:text")
        .attr("class", "nodetext")
        //.attr("dx", 12)
        //.attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(function(d) { return d.name })
        .attr("transform", function(d){
          d.text_length = this.getComputedTextLength();
          return "";
        });

      node.insert("svg:rect", "text")
        .attr("height", 15)
        .attr("width", function(d){ return d.text_length+4; })
        .style("fill", "#cccccc")
        .attr("transform", function(d){ 
          return "translate(-"+(d.text_length/2+2)+" -7.5)";
        });

      force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      });
    },

    addConcept : function(){
      var form = array_to_obj($("#new_concept").serializeArray()),
          sub = this.collection.getNodeByName(form.subject) || new Node({ name : form.subject}),
          ob = this.collection.getNodeByName(form.object) || new Node({ name : form.object}),
          pred = this.collection.getNodeByName(form.predicate) || new Node({ name : form.predicate}),
          con = new Concept({
            subject : sub,
            object : ob,
            predicate : pred
          });
      this.collection.add(con);
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
})(jQuery);
