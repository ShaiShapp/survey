Vue.component('survey-enum-option', {
    props: ['group', 'caption'],
    template: '<div><label>{{ caption }}</label><input type="radio" /></div>'
})

Vue.component('survey-question', {
  props: ['title', 'def', 'type', 'options', 'required'],
  data: function () {
            return {
                valid: 1,
                errormessage: "",
                value: ""
            }
        },
  methods: {validate: validateAnswer},
  template: '<div> \
                 <p v-if="errormessage">{{ errormessage }}</p>\
                 <div v-if="type === \'text\'"><label>{{ title }}:</label><input type="text" v-bind:value="def" v-on:change="validate"/></div> \
                 <div v-if="type === \'number\'"><label>{{ title }}:</label><input type="number" v-bind:value="def" v-on:change="validate" /></div> \
                 <div v-if="type === \'email\'"><label>{{ title }}:</label><input type="email" v-bind:value="def" v-on:change="validate" /></div> \
                 <div v-if="type === \'enum\'"><label>{{ title }}:</label><survey-enum-option v-for="option, index in options" v-bind:caption="option" v-bind:key="index" /></div> \
             </div>'
})

function validateAnswer(event)
{
    let newValue = event.target.value;
    this.errormessage = "";
    if (this.required && newValue === '') this.errormessage = "Please enter a value";
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
            case "email": break;
            case "enum": break;
        }
    }
    this.valid = (this.errormessage === "");
    this.$emit('input');
}