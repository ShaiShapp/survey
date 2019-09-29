from bottle import route, run, request, post, static_file, HTTPError
import json
import sqlite3
import uuid

@route('/GetSurveyData')
def getSurveyData():
    surveyLink = request.query.surveylink
    db = sqlite3.connect('data/Survey.db')
    cursor = db.cursor()
    cursor.execute("SELECT SURVEYS.ID, TITLE, DESCRIPTOR, SUBMISSION_DATE FROM SURVEY_LINKS JOIN SURVEYS ON SURVEY_LINKS.SURVEY_ID = SURVEYS.ID WHERE LINK_STR = ?", (surveyLink,))
    surveyRow = cursor.fetchone()
    if not surveyRow:
        return '{"error": "Survey not found"}'
    cursor.execute("SELECT QUESTION_ID, ANSWER FROM SURVEY_ANSWERS WHERE LINK = ?", (surveyLink,))
    surveyAnswers = cursor.fetchall()
    db.close()
    survey = {"id": surveyRow[0], "title": surveyRow[1], "descriptor": surveyRow[2], "submissionDate": surveyRow[3], "answers": surveyAnswers}
    return json.dumps(survey)

@route('/GetAllSurveys')
def getAllSurveys():
    db = sqlite3.connect('data/Survey.db')
    cursor = db.cursor()
    cursor.execute("SELECT ID, TITLE FROM SURVEYS")
    surveys = cursor.fetchall()
    db.close()
    return json.dumps(surveys)

@post('/SubmitAnswers')
def submitAnswers():
    surveyLink = request.forms.surveylink
    
    db = sqlite3.connect('data/Survey.db')
    cursor = db.cursor()
    cursor.execute("UPDATE SURVEY_LINKS SET SUBMISSION_DATE = date('now') WHERE LINK_STR = ?;", (surveyLink,))
    db.commit()
    db.close()
    return ""

@post('/SaveAnswer')
def saveAnswer():
    surveyLink = request.forms.surveylink
    answerID = request.forms.answerid
    answerText = request.forms.answertext
    
    db = sqlite3.connect('data/Survey.db')
    cursor = db.cursor()
    # Check if answer exists already
    cursor.execute("SELECT ID FROM SURVEY_ANSWERS WHERE LINK = ? AND QUESTION_ID = ?;", (surveyLink, answerID))
    existingAnswer = cursor.fetchone()
    # Update or insert depending on existing answer
    if existingAnswer:
        cursor.execute("UPDATE SURVEY_ANSWERS SET ANSWER = ? WHERE LINK = ? AND QUESTION_ID = ?;", (answerText, surveyLink, answerID))
    else:
        cursor.execute("INSERT INTO SURVEY_ANSWERS(LINK, QUESTION_ID, ANSWER) VALUES(?, ?, ?);", (surveyLink, answerID, answerText))
    db.commit()
    db.close()
    return ""

@post('/CreateSurvey')
def createSurvey():
    surveyDescriptor = request.forms.descriptor
    if not surveyDescriptor:
        return HTTPError(400, "Missing survey descriptor")
    try:
        surveyObject = json.loads(surveyDescriptor)
    except ValueError:
        return HTTPError(400, "Malformed survey descriptor")
    surveyTitle = surveyObject["title"]
    surveyQuestions = surveyObject["questions"]
    
    # Validate the survey. For now, only very basic validation, making sure the main elements exist.
    if not surveyTitle:
        return HTTPError(400, "Missing survey title")
    if not surveyQuestions:
        return HTTPError(400, "Missing survey questions")
    
    # Insert into the database.
    db = sqlite3.connect('data/Survey.db')
    cursor = db.cursor()
    cursor.execute("INSERT INTO SURVEYS(TITLE, DESCRIPTOR) VALUES(?, ?);", (surveyTitle, surveyDescriptor))
    newItemId = cursor.lastrowid
    db.commit()
    db.close()
    
    return str(newItemId)

@post('/CreateSurveyLink')
def createSurveyLink():
    surveyID = request.forms.surveyid
    newSurveyLink = str(uuid.uuid4())
    
    # Insert into the database.
    db = sqlite3.connect('data/Survey.db')
    cursor = db.cursor()
    cursor.execute("INSERT INTO SURVEY_LINKS(SURVEY_ID, LINK_STR) VALUES(?, ?);", (surveyID, newSurveyLink))
    newItemId = cursor.lastrowid
    db.commit()
    db.close()
    
    return "/survey?SurveyLink=" + newSurveyLink

@route('/static/<filename>')
def server_static(filename):
    return static_file(filename, root='static')

@route('/survey')
def survey():
    return static_file("Index.html", root='static')

run(host='localhost', port=8080, debug=True)