# Survey

## Introduction
Survey system for showing off my Javascript skills. Frontend built using Vue.js, and backend written in Python. An example deployment can be found here:

### http://shaishap.pythonanywhere.com/survey?SurveyLink=6006fea4-180e-4f7e-a278-07661e1bdce1

## Definitions
Each survey is a set of questions. To send a survey for people to answer, links must be generated. A link is one instance of a survey, meant to be sent to one user.

## Administration
Surveys and links are created using an api. It includes two calls:

### /CreateSurvey
Creates a survey. Accepts a single argument named descriptor, which is a JSON string in the following format:

```javascript
{"title": "Test Survey",
 "questions": [{"title": "<title>",
                "type":  "<type>",
                "required": "yes"
                "options": ["<option>", "<option>"]
               }]
}
```

Where "type" may be "text", "number", "email", or "enum". The "required" element is (ironically) optional, and must be omitted for a non-mandatory question, and the "options" element is only for type="enum".
The call returns a number, which is the survey ID. It is needed for later creating the survey link.

### /CreateSurveyLink
Creates a survey link. Accepts a single parameter named surveyid, which is the ID returned by /CreateSurvey. Returns the address of the survey page using the new link.

For convenience, an administration page has been created that allows calling the API through an HTML page, but it is not an official part of the system and was built for speed, not quality:

### http://shaishap.pythonanywhere.com/static/Administration.html

## Usage
To answer a survey, open the appropriate link (using the address generated by the /CreateSurveyLink call). Answer the questions (either one per page or all together), and submit. After submitting, the link will remain valid in read-only mode, for seeing the answer summary.
