function(doc){
  if(doc.type === "map"){
    emit([doc._id,1], doc);
    emit([doc._id,4], null);
  }
  else if (doc.type === "proposition"){
    for (map in doc.maps){
      emit([doc.maps[map],2,doc._id], doc);}}
  else if (doc.type === "concept"){
    for (map in doc.maps){
      emit([doc.maps[map],3,doc._id], doc);}}
}
