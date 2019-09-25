from bottle import route, run, request, post, static_file
import json

@route('/GetSurveyData')
def getSurveyData():
    surveyLink = request.query.surveylink
    testSurvey = {"title": "Test Survey", "questions": [{"title": "Age","type": "number","required": "yes"}, {"title": "Name","type": "text"},{"title": "Email","type": "email"},{"title": "Language","type": "enum","options": ["English", "עברית"]}],"answers": []}
    return json.dumps(testSurvey)

@post('/SaveAnswer')
def saveAnswer():
    surveyLink = request.query.surveylink
    answerID = request.query.answerid

@route('/static/<filename>')
def server_static(filename):
    return static_file(filename, root='static')

@route('/SurveyComponents')
def surveyComponents():
    return static_file("SurveyComponents.js", "static")

@route('/survey')
def survey():
    return static_file("Index.html", root='static')

run(host='localhost', port=8080, debug=True)