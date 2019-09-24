Vue.component('survey-enum-option', {
    props: ['group', 'caption'],
    template: '<div><label>{{ caption }}</label><input type="radio" /></div>'
})

Vue.component('survey-question', {
  props: ['title', 'def', 'type', 'options', 'required', 'idx'],
  data: function () {
            return {
                validvalue: 1,
                errormessage: "",
                value: this.def
            }
        },
  methods: {validate: validateAnswer},
  template: '<div> \
                 <p v-if="errormessage">{{ errormessage }}</p> \
                 <div v-if="type === \'text\'"><label>{{ title }}:</label><input type="text" v-bind:value="value" v-on:change="validate"/></div> \
                 <div v-if="type === \'number\'"><label>{{ title }}:</label><input type="number" v-bind:value="value" v-on:change="validate" /></div> \
                 <div v-if="type === \'email\'"><label>{{ title }}:</label><input type="email" v-bind:value="value" v-on:change="validate" /></div> \
                 <div v-if="type === \'enum\'"><label>{{ title }}:</label><survey-enum-option v-for="option, index in options" v-bind:caption="option" v-bind:key="index" /></div> \
             </div>'
})

function validateAnswer(event)
{
    let newValue = event.target.value;
    this.errormessage = "";
    if (this.required && newValue === "") this.errormessage = "Please enter a value";
    else
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
    this.validvalue = (this.errormessage === "");
    this.value = newValue;
    //this.$emit('input', {answer: newValue, index: this.idx});
    this.$emit('input', newValue, this.idx);
}