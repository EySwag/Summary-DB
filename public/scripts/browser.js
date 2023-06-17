function gradeToGrade(grade) {
    return ["ז","ח","ט","י","יא","יב","בגרות"][grade];
}
var container = document.getElementById("Container")
function createItem(title,description,path,author,grade,subject){
    var div = document.createElement('div')
    div.setAttribute("class","file");
    var h2 = document.createElement("h2")
    var span = document.createElement("span");
    var button = document.createElement("button");
    h2.innerText = title;

    span.innerText = "מאת: "+ author + "," + " שכבה: " + gradeToGrade(grade) +", מקצוע: "+ translateSubject(subject) +"\n" + description;
    button.setAttribute("type", "submit");
    button.setAttribute("onclick", "window.open(\'" + "/files/" + path + "\');")
    div.appendChild(h2);
    div.appendChild(span);
    div.appendChild(button);
    container.appendChild(div);
}
function itemsWithFilters(gradeFilters,subjectFilters,nameFilter){
    clear();
    files.forEach(element => {
        if((gradeFilters.includes(element.grade) || gradeFilters.length == 0) && (subjectFilters.includes(element.subject)|| subjectFilters.length == 0) && (element.summery_name.includes(nameFilter)|| nameFilter == "")){
            createItem(element.summery_name,element.description,element.path_name,element.author,element.grade,element.subject)
        }
    });
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
// תנ\"ך
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
        createItem(element.summery_name,element.description,element.path_name,element.author,element.grade,element.subject)
    });
})