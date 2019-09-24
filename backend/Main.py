from bottle import route, run, request
import json

@route('/GetSurveyData')
def getSurveyData():
    surveyLink = request.query.surveylink
    testSurvey = {"title": "Test Survey", "questions": [{"title": "Age","type": "number","required": "yes"}, {"title": "Name","type": "text"},{"title": "Email","type": "email"},{"title": "Language","type": "enum","options": ["English", "עברית"]}],"answers": []}
    return json.dumps(testSurvey)

@post('SaveAnswer')
def saveAnswer():
    surveyLink = request.query.surveylink
    answerID = request.query.answerid

@route('/survey')
def survey():
    return """
           <!DOCTYPE html>
<html>
<head>
  <title>Shai's Surveys</title>
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
  <script src="http://shaishap.pythonanywhere.com/SurveyComponents.js"></script>
</head>
<body>  
  <div id="SurveyDiv" v-bind:title="title">
    <h3>{{ title }}</h3>
    <survey-question v-for="question, index in questions"
                     v-bind:title="question.title"
                     v-bind:idx="index"
                     v-bind:def="question.default || ''"
                     v-bind:key="index"
                     v-bind:type="question.type || 'text'"
                     v-bind:options="question.options"
                     v-bind:required="question.required"
                     v-on:input="save"></survey-question>
    <button v-on:click="submitForm();">Submit</button>
  </div>

  <script>
    /*var vueData = {title: "Test Survey",
                   questions: [
                                  {title: "Age",
                                   type: "number",
                                   required: "yes"
                                  },
                                  {title: "Name",
                                   type: "text"
                                  },
                                  {title: "Email",
                                   type: "email"
                                  },
                                  {title: "Language",
                                   type: "enum",
                                   options: ["English", "עברית"]
                                  }
                               ],
                    answers: []};
    
    var vm = new Vue({
        el: '#SurveyDiv',
        data: vueData,
        methods: {submitForm: submitForm, save: saveAnswer}
    });*/
    
    loadSurveyData();
    
    function saveAnswer(answer, index)
    {
        this.answers[index] = answer;
    }

    function submitForm()
    {
        //alert("Submitting");
    }
    
    function loadSurveyData()
    {
        let urlParams = new URLSearchParams(window.location.search);
        let surveyLink = urlParams.get('SurveyLink');
        if (!surveyLink) return;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var vueData = JSON.parse(this.responseText);
                var vm = new Vue({
                    el: '#SurveyDiv',
                    data: vueData,
                    methods: {submitForm: submitForm, save: saveAnswer}
                });
            }
          };
        xhttp.open("GET", "GetSurveyData?surveylink=" + surveyLink, true);
        xhttp.send();
    }
    
  </script>
</body>
</html>
           """

run(host='localhost', port=8080, debug=True)