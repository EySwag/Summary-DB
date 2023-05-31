var container = document.getElementById("Container")
function createItem(title,description,path){
    var div = document.createElement('div')
    div.setAttribute("class","file");
    var h2 = document.createElement("h2")
    var span = document.createElement("span");
    var button = document.createElement("button");
    h2.innerText = title;
    span.innerText = description;
    button.setAttribute("type", "submit");
    button.setAttribute("onclick", "window.open(\'" + "/files/" + path + "\');")
    div.appendChild(h2);
    div.appendChild(span);
    div.appendChild(button);
    container.appendChild(div);
}
function clear(){
    container.innerHTML = "";
}
var files;
function get(url,callback){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.setRequestHeader("Accept", "application/json");

    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        files=JSON.parse(xhr.responseText)
        callback()
    }};

    xhr.send();
}
get("/files",function(){
    files.forEach(element => {
        createItem(element.summeryName,element.description,element.pathname)
    });
})