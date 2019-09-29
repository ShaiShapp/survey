// This component represents one element of a survey question of type enum. It is meant to be used inside a survey-question component.
Vue.component('survey-enum-option', {
    props: {caption: String, // Title to show on this option
            name: String,    // Unique identifier for this enum group
            idx: Number,     // Index of this option in the enum
            choice: String,  // Option currently selected out of the enum (if any)
            question: Number // Index of the current question out of the survey
           },
    computed: {
                isChecked: function() {return (this.choice === ("" + this.idx));} // Will this option be selected. 
            },
    methods: {input: validateEnumAnswer},
    template: '<div class="survey-question-option-container"> \
               <input type="radio" v-bind:name="name" v-on:change="input" v-bind:value="idx" v-bind:checked="isChecked"/> \
               <label>{{ caption }}</label></div>'
})

// This is the base component for a question in a survey. For now we support four question types: text, number, email and enum.
Vue.component('survey-question', {
  props: {title: String,      // Text of the actual question
          def: String,        // Default value
          type: String,       // Question type. Must be one of: text, number, email, enum
          options: Array,     // Array of strings representing possible options for an enum question. Ignored for any other question type
          required: Boolean,  // Whether or not the question requires an answer for a survey to be valid
          idx: Number         // Index of the question out of the survey
         },
  data: function () {
            return {
                errormessage: "",                  // Error message to be shown in case of invalid answer
                value: this.def,                   // Current response to the question
                questionID: "Question" + this.idx  // String to be used internally as an identifier for this question
            }
        },
  methods: {validate: validateAnswer,     // Validate the response and propogate it up for saving
            propagate: propogateAnswer},  // Propogate a response for saving (after it has been validated by a child component)
  template: '<div> \
                 <p v-if="errormessage">{{ errormessage }}</p> \
                 <div v-if="type === \'text\'" class="survey-question-container"> \
                    <span v-if="required" class="mandatory-asterisk">*</span> \
                    <label class="survey-question-title">{{ title }}:</label> \
                    <input type="text" v-bind:value="value" v-on:change="validate" class="survey-question-text"/> \
                 </div> \
                 <div v-if="type === \'number\'" class="survey-question-container"> \
                    <span v-if="required" class="mandatory-asterisk">*</span> \
                    <label class="survey-question-title">{{ title }}:</label> \
                    <input type="number" v-bind:value="value" v-on:change="validate" class="survey-question-text"/> \
                 </div> \
                 <div v-if="type === \'email\'" class="survey-question-container"> \
                    <span v-if="required" class="mandatory-asterisk">*</span> \
                    <label class="survey-question-title">{{ title }}:</label> \
                    <input type="email" v-bind:value="value" v-on:change="validate" class="survey-question-text" /> \
                 </div> \
                 <div v-if="type === \'enum\'" class="survey-question-container"> \
                    <span v-if="required" class="mandatory-asterisk">*</span> \
                    <label class="survey-question-title">{{ title }}:</label> \
                    <survey-enum-option v-for="option, index in options" v-bind:caption="option" v-bind:key="index" v-bind:choice="value" v-bind:idx="index" v-bind:question="idx" v-bind:name="questionID" v-on:propagate="propagate"/> \
                 </div> \
             </div>'
})

// This component represents one question as shown in a summary of responses to the survey.
Vue.component('survey-answer-summary', {
  props: {'question': String,
          'answer' : String
         },
  template: '<div class="survey-answer-container"> \
                 <div><label>{{ question }}:</label><span>{{ answer }}</span></div> \
             </div>'
})

// Send an already-validated answer to the parent component to be saved.
function propogateAnswer(answer, index)
{
    this.$emit('input', answer, index);
}

// Validate an enum response, then emit it back to the question component.
function validateEnumAnswer(event)
{
    let newValue = event.target.value;
    if (!newValue) return;
    this.$emit('propagate', newValue, this.question);
}

// Validate an answer and emit it back to the parent component to be saved. If invalid, it will populate the errormessage data value.
function validateAnswer(event)
{
    let newValue = event.target.value;
    this.errormessage = "";
    if (this.required && newValue === "") this.errormessage = "Please enter a value";
    else if (newValue)
    {
        switch (this.type)
        {
            case "text": break;
            case "number": if (isNaN(parseFloat(newValue)))
                           {
                               this.errormessage = "Please enter a valid number";
                           }
                           break;
            case "email": if (!/\S+@\S+\.\S+/.test(newValue)) // Email validation is tricky. We want to go for a relatively permissive one, to minimize false positives.
                          {
                            this.errormessage = "Please enter a valid email address";
                          }
                          break;
            case "enum": break;
        }
    }
    this.validValue = (this.errormessage === "");
    this.value = newValue;
    if (this.validValue) this.$emit('input', newValue, this.idx); // We only send back a validated answer for saving. An invalid answer will stay on the screen, but will not be persisted.
}