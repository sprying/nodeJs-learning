function Person(name){
    this.name = name;
}
Person.prototype.sayHello = function(){
    return 'Hello everyone, my name is '+ this.name;
}
exports.Person = Person;