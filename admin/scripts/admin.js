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
function gradeToGrade(grade) {
    return ["ז","ח","ט","י","יא","יב","בגרות"][grade];
}
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

function createItemPending(title,description,path,id,author,grade,subject){
    var div = document.createElement('div');
    div.setAttribute("class","file");
    var div2 = document.createElement('div');
    var div3 = document.createElement('div');
    var h2 = document.createElement("h2")
    var span = document.createElement("span");
    var download = document.createElement("button");
    h2.innerText = title;
    span.innerText = "מאת: "+ author + "," + " שכבה: " + gradeToGrade(grade) +", מקצוע: "+ translateSubject(subject) +"\n" + description;
    download.setAttribute("type", "submit");
    download.setAttribute("onclick", "window.open(\'" + "/pending/" + path + "?pass=" + AdminPass +"\');")
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
    div2.setAttribute("class","ItemText")
    div3.setAttribute("class","ButtonCon")
    container.appendChild(div);
}
function createItem(title,description,path,id,author,grade,subject){
    var div = document.createElement('div');
    div.setAttribute("class","file");
    var div2 = document.createElement('div');
    var div3 = document.createElement('div');
    var h2 = document.createElement("h2")
    var span = document.createElement("span");
    var download = document.createElement("button");
    h2.innerText = title;
    span.innerText = "מאת: "+ author + "," + " שכבה: " + gradeToGrade(grade) +", מקצוע: "+ translateSubject(subject) +"\n" + description;
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
    div2.setAttribute("class","ItemText");
    div3.setAttribute("class","ButtonCon");
    container.appendChild(div);
}
function translateSubject(english){
    var translations = {
        "lashon":"לשון",
        "math":"מתמטיקה",
        "english":"אנגלית",
        "history":"היסטוריה",
        "literature":"ספרות",
        "tanakh":"תנ\"ך",
        "citizenship":"אזרחות",
        "geography":"גאוגרפיה",
        "chemistry":"כימיה",
        "biology":"ביולוגיה",
        "physics":"פיזיקה",
        "software_engineering":"הנדסת תוכנה",
        "computer_science":"מדעי המחשב",
        "art":"אומנות",
        "humanistics":"הומניסטיקה"
    }
    return translations[english];
}
function itemsWithFilters(gradeFilters,subjectFilters,nameFilter){
    clear();
    var isPending = gradeFilters.includes("pending");
    var index = gradeFilters.indexOf("pending");
    if (index !== -1) {
        gradeFilters.splice(index, 1);
    }
    pending.forEach(element => {
        if((gradeFilters.includes(element.grade) || gradeFilters.length == 0) && (subjectFilters.includes(element.subject)|| subjectFilters.length == 0) && (element.summery_name.includes(nameFilter)|| nameFilter == "")){
            createItemPending(element.summery_name,element.description,element.path_name,element.id,element.author,element.grade,element.subject)
        }
    });
    if(!isPending){
        files.forEach(element => {
            if((gradeFilters.includes(element.grade) || gradeFilters.length == 0) && (subjectFilters.includes(element.subject)|| subjectFilters.length == 0) && (element.summery_name.includes(nameFilter)|| nameFilter == "")){
                createItem(element.summery_name,element.description,element.path_name,element.id,element.author,element.grade,element.subject)
            }
        });
    }
}
var gradeFilters = [];
var subjectFilters = [];
function onSelect(e){
    e.currentTarget.classList.toggle("selected");
    var items = document.getElementsByClassName("item");
    gradeFilters = [];
    subjectFilters = [];
    for(var i = 0; i < items.length; i++){
        if(items[i].classList.contains("selected")){
            if(items[i].parentElement.id == "gradeCon"){
                gradeFilters.push(items[i].getAttribute("filter"));
            }else if(items[i].parentElement.id == "subjectCon"){
                subjectFilters.push(items[i].getAttribute("filter"));
            }
        }
    }
    itemsWithFilters(gradeFilters,subjectFilters,"");
}
var items = document.getElementsByClassName("item");
for(var i = 0; i < items.length;i++){
    items[i].addEventListener("click",onSelect);
}
document.getElementById("searchByName").addEventListener("input",function(e){
    itemsWithFilters(gradeFilters,subjectFilters,e.target.value);
}) 
function clear(){
    container.innerHTML = "";
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
var pending = [];
function get2(url,callback){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("password", AdminPass);

    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        pending = JSON.parse(xhr.responseText);
        callback()
    }};

    xhr.send();
}
function updateList(){
    clear();
    get2("/pending",function(){
        pending.forEach(element => {
            createItemPending(element.summery_name,element.description,element.path_name,element.id,element.author,element.grade,element.subject)
        });
    })
    get("/files",function(){
        files.forEach(element => {
            createItem(element.summery_name,element.description,element.path_name,element.id,element.author,element.grade,element.subject)
        });
    })
}
updateList();