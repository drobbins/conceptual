function conceptual_load(scripts){
  for (var i=0; i < scripts.length; i++) {
    document.write('<script src="'+scripts[i]+'"><\/script>')
  };
};

conceptual_load([
  "scripts/jquery.conceptmap.js",
  "/_utils/script/jquery.form.js",
  "scripts/jquery-ui.min.js"
]);
