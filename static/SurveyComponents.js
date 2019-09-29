Vue.component('survey-enum-option', {
    props: ['group', 'caption'],
    template: '<div><label>{{ caption }}</label><input type="radio" /></div>'
})

Vue.component('survey-question', {
  props: ['title', 'def', 'type', 'options', 'required', 'idx'],
  data: function () {
            return {
                validValue: 1,
                errormessage: "",
                value: this.def
            }
        },
  methods: {validate: validateAnswer},
  template: '<div> \
                 <p v-if="errormessage">{{ errormessage }}</p> \
                 <div v-if="type === \'text\'"><span v-if="required">*</span><label>{{ title }}:</label><input type="text" v-bind:value="value" v-on:change="validate"/></div> \
                 <div v-if="type === \'number\'"><span v-if="required">*</span><label>{{ title }}:</label><input type="number" v-bind:value="value" v-on:change="validate" /></div> \
                 <div v-if="type === \'email\'"><span v-if="required">*</span><label>{{ title }}:</label><input type="email" v-bind:value="value" v-on:change="validate" /></div> \
                 <div v-if="type === \'enum\'"><span v-if="required">*</span><label>{{ title }}:</label><survey-enum-option v-for="option, index in options" v-bind:caption="option" v-bind:key="index" /></div> \
             </div>'
})

Vue.component('survey-answer-summary', {
  props: ['title', 'type', 'idx', 'answer'],
  computed: {
                isTextType: function() {return this.type === 'text' || this.type === 'number' || this.type === 'email';}
            },
  template: '<div> \
                 <div v-if="isTextType"><label>{{ title }}:</label><span>{{ answer }}</span></div> \
                 <div v-if="type === \'enum\'"><label>{{ title }}:</label><span>{{ answer }}</span></div> \
             </div>'
})

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