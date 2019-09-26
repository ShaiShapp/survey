from bottle import route, run, request, post, static_file
import json
import sqlite3

@route('/GetSurveyData')
def getSurveyData():
    surveyLink = request.query.surveylink
    testSurvey = {"title": "Test Survey", "questions": [{"title": "Age","type": "number","required": "yes"}, {"title": "Name","type": "text"},{"title": "Email","type": "email"},{"title": "Language","type": "enum","options": ["English", "עברית"]}],"answers": []}
    db = sqlite3.connect('data/Survey.db')
    cursor = db.cursor()
    cursor.execute("SELECT ID, TITLE FROM SURVEYS WHERE ID = (SELECT SURVEY_ID FROM SURVEY_LINKS WHERE LINK_STR = ?)", (surveyLink,))
    if cursor.rowcount < 1:
        return '{"error": "Unknown survey link"}'
    survey = cursor.fetchone()
    return "{id: " + survey[0] + ", title: " + survey[1] + "}"
    db.close()
    return json.dumps(testSurvey)

@post('/SaveAnswer')
def saveAnswer():
    surveyLink = request.forms.surveylink
    answerID = request.forms.answerid

@post('/CreateSurvey')
def createSurvey():
    surveyDescriptor = json.load(request.forms.descriptor)
    for question in surveyDescriptor:
        print(question)
    return

@route('/static/<filename>')
def server_static(filename):
    return static_file(filename, root='static')

@route('/survey')
def survey():
    return static_file("Index.html", root='static')

run(host='localhost', port=8080, debug=True)