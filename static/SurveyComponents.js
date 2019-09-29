Vue.component('survey-enum-option', {
    props: {group: String,
            caption: String,
            name: String,
            idx: Number,
            question: Number,
            choice: String
           },
    computed: {
                isChecked: function() {return (this.choice === ("" + this.idx));}
            },
    methods: {input: validateEnumAnswer},
    template: '<div class="survey-question-option-container"><input type="radio" v-bind:name="name" v-on:change="input" v-bind:value="idx" v-bind:checked="isChecked"/><label>{{ caption }}</label></div>'
})

Vue.component('survey-question', {
  props: ['title', 'def', 'type', 'options', 'required', 'idx'],
  data: function () {
            return {
                validValue: 1,
                errormessage: "",
                value: this.def,
                questionID: "Question" + this.idx
            }
        },
  methods: {validate: validateAnswer,
            propagate: propogateAnswer},
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

Vue.component('survey-answer-summary', {
  props: ['title', 'type', 'idx', 'answer'],
  computed: {
                isTextType: function() {return this.type === 'text' || this.type === 'number' || this.type === 'email';}
            },
  template: '<div class="survey-answer-container"> \
                 <div v-if="isTextType"><label>{{ title }}:</label><span>{{ answer }}</span></div> \
                 <div v-if="type === \'enum\'"><label>{{ title }}:</label><span>{{ answer }}</span></div> \
             </div>'
})

function propogateAnswer(answer, index)
{
    this.$emit('input', answer, index);
}

function validateEnumAnswer(event)
{
    let newValue = event.target.value;
    if (!newValue) return;
    this.$emit('propagate', newValue, this.question);
}

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
    if (this.validValue) this.$emit('input', newValue, this.idx);
}