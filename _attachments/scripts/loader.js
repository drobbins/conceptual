(function(){
    function app_load(scripts) {
      for (var i=0; i < scripts.length; i++) {
        document.write('<script src="'+scripts[i]+'"><\/script>')
      };
    };

    app_load([
        "scripts/jquery.min.js",
        "scripts/underscore-min.js",
        "scripts/backbone.js"
    ]);
})();
