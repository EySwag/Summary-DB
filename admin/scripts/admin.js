function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
        end = dc.length;
        }
    }
    // because unescape has been deprecated, replaced with decodeURI
    //return unescape(dc.substring(begin + prefix.length, end));
    return decodeURI(dc.substring(begin + prefix.length, end));
}
var AdminPass = getCookie("AdminPass");
function init(){
    if(AdminPass == null){
        AdminPass = prompt("סיסמא?");
        if(AdminPass == null){
            location.href="/";
        }
    }
    var xmlHttpRequest = new XMLHttpRequest();  
    xmlHttpRequest.open("post", "/validate", false);  
    xmlHttpRequest.setRequestHeader("password",AdminPass);
    xmlHttpRequest.send();  
    if(xmlHttpRequest.status == "403"){
        location.href="/";
        document.cookie ='AdminPass=; Max-Age=-99999999;';  
    }else{
        document.cookie = "AdminPass=" + AdminPass;
    }
}
init();

var container = document.getElementById("Container")
function confirm(id){
    var xmlHttpRequest = new XMLHttpRequest();  
    xmlHttpRequest.open("post", "/confirm", false);  
    xmlHttpRequest.setRequestHeader("password",AdminPass);
    xmlHttpRequest.setRequestHeader("id",id);
    xmlHttpRequest.send();
    updateList();
}

function deny(id){
    var xmlHttpRequest = new XMLHttpRequest();  
    xmlHttpRequest.open("post", "/deny", false);  
    xmlHttpRequest.setRequestHeader("password",AdminPass);
    xmlHttpRequest.setRequestHeader("id",id);
    xmlHttpRequest.send();
    updateList();
}

function remove(id){
    var xmlHttpRequest = new XMLHttpRequest();  
    xmlHttpRequest.open("post", "/remove", false);  
    xmlHttpRequest.setRequestHeader("password",AdminPass);
    xmlHttpRequest.setRequestHeader("id",id);
    xmlHttpRequest.send();
    updateList();
}

function createItemPending(title,description,path,id){
    var div = document.createElement('div');
    div.setAttribute("class","file");
    var div2 = document.createElement('div');
    var div3 = document.createElement('div');
    var h2 = document.createElement("h2")
    var span = document.createElement("span");
    var download = document.createElement("button");
    h2.innerText = title;
    span.innerText = description;
    download.setAttribute("type", "submit");
    download.setAttribute("onclick", "window.open(\'" + "/files/" + path + "\');")
    var confirm = document.createElement("button");
    confirm.innerText = "✓";
    confirm.setAttribute("class", "confirm");
    confirm.setAttribute("onclick", "confirm('" + id + "');");
    var deny = document.createElement("button");
    deny.innerText = "X";
    deny.setAttribute("class", "deny");
    deny.setAttribute("onclick", "deny('" + id + "');");
    div2.appendChild(h2);
    div2.appendChild(span);
    div3.appendChild(download);
    div3.appendChild(deny);
    div3.appendChild(confirm);
    div.appendChild(div2);
    div.appendChild(div3);
    div2.setAttribute("style","height:100%;")
    div3.setAttribute("style","height:100%;")
    container.appendChild(div);
}
function createItem(title,description,path,id){
    var div = document.createElement('div');
    div.setAttribute("class","file");
    var div2 = document.createElement('div');
    var div3 = document.createElement('div');
    var h2 = document.createElement("h2")
    var span = document.createElement("span");
    var download = document.createElement("button");
    h2.innerText = title;
    span.innerText = description;
    download.setAttribute("type", "submit");
    download.setAttribute("onclick", "window.open(\'" + "/files/" + path + "\');")
    var remove = document.createElement("button");
    remove.innerText = "X";
    remove.setAttribute("class", "deny");
    remove.setAttribute("onclick", "remove('" + id + "');");
    div2.appendChild(h2);
    div2.appendChild(span);
    div3.appendChild(download);
    div3.appendChild(remove);
    div.appendChild(div2);
    div.appendChild(div3);
    div2.setAttribute("style","height:100%;")
    div3.setAttribute("style","height:100%;")
    container.appendChild(div);
}

function clear(){
    container.innerHTML = "";
    files = [];
}
var files = [];
function get(url,callback){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("password", AdminPass);

    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        files = JSON.parse(xhr.responseText);
        callback()
    }};

    xhr.send();
}
function updateList(){
    clear();
    get("/pending",function(){
        files.forEach(element => {
            createItemPending(element.summeryName,element.description,element.pathnamem,element.id)
        });
    })
    get("/files",function(){
        files.forEach(element => {
            createItem(element.summeryName,element.description,element.pathnamem,element.id)
        });
    })
}
updateList();