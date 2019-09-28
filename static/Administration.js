function createSurvey()
{
    let descriptor = document.getElementById("NewSurveyText").value;
    if (!descriptor) return;
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/CreateSurvey", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");
    xhttp.send("descriptor=" + descriptor);
}

function createSurveyLink()
{
    let surveyID = document.getElementById("SurveyForLinkInput").value;
    if (!surveyID) return;
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/CreateSurveyLink", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");
    xhttp.send("surveyid=" + surveyID);
}