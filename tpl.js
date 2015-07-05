/**
 * Created by sprying on 15/4/6.
 */

var tmp = '<li><%=new1%></li>';

var escape = function(str) {
    if (!str) {
        return "";
    }
    return str.replace(/\&/g, "&amp;").replace(/\>/g, "&gt;").replace(/\</g, "&lt;").replace(/\"/g, "&quot;").replace(/\'/g, "&#x27;").replace(/\//g, "&#x2F;");
}
var compileHandler = function(str,data){
    var tpl = str.replace(/<%=([\s\S]+?)%>/g,function(match,code){
        return "' + escape(" + code + ")+ '";
    }).replace(/<%-([\s\S]+?)%>/g,function(match,code){
        return "' +" + code + "+ '";
    }).replace(/<%([\s\S]+?)%>/g,function(match,code){
        return "';\n" + code + "\ntpl += '";
    });


    tpl = "tpl = '" + tpl + "'";
    tpl = 'var tpl = "";\nwith (obj) {' + tpl + '}\nreturn tpl;';
    return new Function('obj,escape',tpl);
};


var tmp = '<% if (status == "2"){%>'+
    '<%=hi%>，we meet again.' +
    '<%}else{%>' +
    '<%=hi%>,nice to meet you' +
    '<%}%>';
var compile = compileHandler(tmp);
var resultStr = compile({status:2,hi:'ping ping'},escape);
console.log(resultStr);
