// Load the survey from the server based on the url link, and initialize the app based on it.
function loadSurveyData()
{
    let urlParams = new URLSearchParams(window.location.search);
    let surveyLink = urlParams.get('SurveyLink');
    if (!surveyLink) return;
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let surveyData = JSON.parse(this.responseText);
            if (surveyData.hasOwnProperty("error")) // In case of error (such as invalid link), the server will return an error object and we want to display it.
            {
                document.getElementById("SurveyDiv").style.display = "none";
                document.getElementById("ErrorMessage").style.display = "block";
                document.getElementById("ErrorMessage").innerText = "Error: " + surveyData.error;
            } else
            {
                // If no error, we initialize the Vue app here
                let surveyDescriptor = JSON.parse(surveyData.descriptor);
                return initializeApp(surveyDescriptor, surveyData.answers, surveyData.submissionDate);
            }
        }
      };
    xhttp.open("GET", "/GetSurveyData?surveylink=" + surveyLink, true);
    xhttp.send();
}

function initializeApp(surveyDescriptor, surveyAnswers, submissionDate)
{
    initializeSurveyAnswers(surveyDescriptor, surveyAnswers);             // We save the answers in memory in a convenient format to work with.
    surveyDescriptor.currentQuestionIndex = 0;                            // When showing questions one at a time, this is the current question shown.
    surveyDescriptor.displayMode = submissionDate ? 'summary' : 'survey'; // If the survey has been submitted already, we only show the answer summary.
    surveyDescriptor.validationError = '';                                // This string will be filled in case of trying to submit with invalid answers.
    surveyDescriptor.submissionDate = submissionDate;
    surveyDescriptor.pagedMode = false;                                   // For now, paged mode always means showing answers one at a time.
    let vm = new Vue({
        el: '#SurveyDiv',
        data: surveyDescriptor,
        methods: {submitAnswers: submitAnswers,    // This submits the whole survey. Since answers are saved in real time anyway, it just means marking the survey as done.
                  save: saveAnswer,                // Save an answer in the server. Should only be called for a valid answer.
                  validateSurvey: validateSurvey,  // For now, the only server-level validation is making sure all mandatory questions are answered. Other validation happens when answering each question.
                  togglePagedMode: function() {this.pagedMode = !this.pagedMode;},
                  showSummary: function() {if (this.validateSurvey(surveyDescriptor)) this.displayMode = 'summary';},
                  showSurvey: function() {this.displayMode = 'survey'},
                  nextQuestion: function() {this.currentQuestionIndex++;},
                  previousQuestion: function() {this.currentQuestionIndex--;},
                  isLastQuestion: function() {return this.currentQuestionIndex === this.questions.length - 1;},
                  isFirstQuestion: function() {return this.currentQuestionIndex === 0;}}
    });
    return vm;
}

// Validate the survey. This is not validation for each question, but for the survey as a whole - For now, this just means making sure all mandatory questions are answered.
// Validation for each specific question happens at the time of answering, and an invalid answer will not be saved in the data storage.
function validateSurvey(surveyDescriptor)
{
    let unansweredQuestions = [];
    for (let i = 0; i < surveyDescriptor.questions.length; i++)
    {
        if (!surveyDescriptor.answers[i] && surveyDescriptor.questions[i].required) unansweredQuestions.push(surveyDescriptor.questions[i].title);
    }
    if (unansweredQuestions.length > 0)
    {
        // This should definitely be designed better. Ideally we'd want to format the error message in a way that doesn't look terrible for long-titled messages.
        surveyDescriptor.validationError = "Please provide valid answers to the following questions: " + unansweredQuestions.join(", ");
        return false;
    } else
    {
        surveyDescriptor.validationError = "";
        return true;
    }
}

// Save an answer to one question in the server.
function saveAnswer(answer, index)
{
    let urlParams = new URLSearchParams(window.location.search);
    let surveyLink = urlParams.get('SurveyLink');
    this.answers[index] = answer;
    this.answersForDisplay[index] = getAnswerForDisplay(this, index, answer);
    
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && !this.status == 200) {
            console.log(this.responseText); // In the future, we might want to somehow gracefully handle a case where the server is not responding (offline mode).
        }
      };
    xhttp.open("POST", "/SaveAnswer", true);
    xhttp.send("surveylink=" + surveyLink + "&answerid=" + index + "&answertext=" + answer);
}

// This submits the whole survey. Since answers are saved in real time anyway, it just means marking the survey as done.
function submitAnswers()
{
    let urlParams = new URLSearchParams(window.location.search);
    let surveyLink = urlParams.get('SurveyLink');
    
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            window.location.reload();
        }
      };
    xhttp.open("POST", "/SubmitAnswers", true);
    xhttp.send("surveylink=" + surveyLink);
}

// Here we save the answers in memory in a convenient format to work with. The answers come from the server as an array of arrays, each with two values: index and answer. We
// Create two arrays for our data object: surveyDescriptor.answers will match indices to answers, and surveyDescriptor.answersForDisplay will do the same with answers meant for human display.
// For now, the only difference is that for enum answers, the answer we work with internally is the index out of the options array, while the display answer is the option caption.
function initializeSurveyAnswers(surveyDescriptor, surveyAnswers)
{
    surveyDescriptor.answers = {};
    surveyDescriptor.answersForDisplay = {};
    if (surveyAnswers && Array.isArray(surveyAnswers))
    {
        surveyAnswers.forEach(function (answer) {surveyDescriptor.answers[answer[0]] = answer[1];
                                                 surveyDescriptor.answersForDisplay[answer[0]] = getAnswerForDisplay(surveyDescriptor, answer[0], answer[1])});
    }
}

function getAnswerForDisplay(surveyDescriptor, index, answer)
{
    let question = surveyDescriptor.questions[index];
    return (question.type !== "enum" ? answer : question.options[answer]);
}