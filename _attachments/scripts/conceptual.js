(function(){

  /**
   * Baseline setup (modeled after Underscore JS)
   */
  var root = this,
      previous_Conceptual = root.Conceptual,
      Conceptual = {};

  Conceptual.array_to_obj = function(array){
    var obj = {};
    array.forEach(function(el){
      obj[el.name] = el.value;
    });
    return obj;
  }

  Conceptual.Concept = Backbone.Model.extend({
    defaults : {
      subject : "subject",
      predicate : "predicate",
      object : "object"
    }
  });

  Conceptual.ConceptMap = Backbone.Collection.extend({
    model : Conceptual.Concept
  });

  Conceptual.ConceptView = Backbone.View.extend({
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

  Conceptual.ConceptMapView = Backbone.View.extend({
    el : $('#main'),

    events : {
      "submit form#new_concept" : "addConcept"
    },

    initialize : function(){
      _.bindAll(this, 'render', 'addConcept', 'appendConcept');

      this.collection = new Conceptual.ConceptMap();
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
      var concept = new Conceptual.Concept(),
          form = Conceptual.array_to_obj($("#new_concept").serializeArray());
      concept.set({
        subject : form.subject,
        predicate : form.predicate,
        object : form.object
      });
      this.collection.add(concept);
      return false;
    },

    appendConcept : function(concept){
      var conceptView = new Conceptual.ConceptView({
        model : concept
      });
      $(this.el).append(conceptView.render().el);
    }
  });

  var ListView = Backbone.View.extend({
    el : $("body"),

    events : {
      'click button#add' : 'addItem'
    },

    initialize : function(){
      _.bindAll(this, 'render', 'addItem', 'appendItem');

      this.collection = new List();
      this.collection.bind('add', this.appendItem);

      this.counter = 0;
      this.render();
    },

    render : function(){
      $(this.el).append("<button id='add'>Add list item</button>");
      $(this.el).append("<ul></ul>");
      _(this.collection.models).each(function(item){
        appendItem(item);
      }, this);
    },

    addItem : function(){
      this.counter += 1;
      var item = new Item();
      item.set({
        part2: item.get('part2') + " " + this.counter
      });
      this.collection.add(item);
    },

    appendItem : function(item){
      var itemView = new ItemView({
        model : item
      });
      $('ul', this.el).append(itemView.render().el);
    }
  });

  conceptmapview = new Conceptual.ConceptMapView();
})(jQuery);
