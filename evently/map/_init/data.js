function(data){
  var statements = [];
  var propositions = {}, concepts = {};
  var loading_functions = {
    2 : function(row){propositions[row.id] = row.value},
    3 : function(row){concepts[row.id] = row.value},
  };
  data.rows.map(function(row){
    var type = row.key[1];
    loading_functions[type] && loading_functions[type](row);
  });
  for (proposition in propositions){
    for (object in proposition.objects){
      statements.push({
        statement : [
          concepts[proposition.subjects],
          concepts[proposition.predicate],
          concepts[proposition.objects[object]]].join(" ")
      });
    }
  }
  return statements;
}
