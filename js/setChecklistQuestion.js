$(document).ready(function () {




})

$(document).on("authready", function (event) {

    //openWaitingModal()

    //displayWorkflow("CurriculumWorkflow");


});

$(document).on('change', '#process_selector', function () {
    selectedProcess = $(this).val()
    $(".dynamic").remove();
    $(".notifylistdiv").remove()
    if (selectedProcess === "-1") {
        return 0
    }
    //console.log(selectedProcess)

    fetchDataForProcess(selectedProcess)


});

processSteps = []
async function fetchDataForProcess(processName) {

    $("#stepList").removeClass("standout");
    $("#stepList").empty()
    stepsList = await db.collection(processName).orderBy("index").get()
    processSteps = []
    stepsList.forEach((doc) => {
        processSteps.push(doc)
        //console.log(doc.data())
    })
    //console.log(processSteps[0].id)
    numberofsteps = processSteps.length
    firstOption = $("<option/>").attr("value", "-1")
    $("#stepList").empty()
    $("#stepList").append($(firstOption))
    for (stepIndex = 0; stepIndex < numberofsteps; stepIndex++) {

        step = processSteps[stepIndex];
        stepID = step.id
        stepName = step.data().name
        newOption = $("<option/>").attr("value", stepID).text(stepName)
        $("#stepList").append($(newOption))

    }
    $("#stepList").removeAttr("disabled").attr("class", "standout");

}

$(document).on('change', '#stepList', function () {
    selectedStep = $(this).val()
    if (selectedStep === "-1") {
        return 0
    }

    createGroupKeyChoices(selectedStep);


});




groupKeyLabels = []
function createGroupKeyChoices(selectedStep) {
    $("#stepNotifyList").removeClass("hide")
    numberofsteps = processSteps.length
    //groupKeysDiv=$("<div/>").attr("class","grid_12").text("No Group Key");
    //$("#p_container").append(groupKeysDiv)
    $(".dynamic").remove();
    groupKeyLabels = []
    for (stepIndex = 0; stepIndex < numberofsteps; stepIndex++) {

        step = processSteps[stepIndex];
        stepID = step.id
        stepData = step.data()

        //console.log(selectedStep)
        if (stepID !== selectedStep) {
            continue;
        }

        if (!("fields" in stepData)) {
            return 0

        }

        fieldList = stepData["fields"]
        //console.log(fieldList)
        fieldsCount = fieldList.length
        keySequence = 0;
        for (fieldIndex = 0; fieldIndex < fieldsCount; fieldIndex++) {
            field = fieldList[fieldIndex]

            type = field["type"]

            // Only Dropdown fields can be user group keys
            if (type != "dropdown") {
                continue
            }
            //Possible that the field doesnt have the attribute
            //Move on to the next field
            if (!("userGroupKey" in field)) {
                continue;
            }

            userGroupKey = field["userGroupKey"]
            if (userGroupKey) {
                /* it means that this specific field determines
                the selection of a usergroup
                */
                //$(groupKeysDiv).remove()
                /*label=fieldList["label"]
                fieldValues=field["options"]
                labelDiv=$("<div/>")
                selectElement=createDropdownElement(fieldValues, keySequence)
                */
                //console.log(field["label"])
                createFieldRow(field, keySequence)
                groupKeyLabels.push(field.label)
                keySequence++


            }

        }





    }
}

function createFieldRow(fieldMeta, sequence) {
    labelDiv = $('<div/>').attr("class", "grid_4 fieldlabel dynamic").text(fieldMeta["label"])
    fieldDiv = $('<div/>').attr("class", "grid_6 field dynamic")
    emptyDiv = $('<div/>').attr("class", "clear dynamic")

    options = fieldMeta["options"];

    mandatory = fieldMeta["mandatory"];
    dd = $("<select/>")
        .attr("id", sequence)
        .attr("name", sequence)
        .attr("class", "groupKey")
    if (mandatory) {
        $(dd).attr("required", true)
    }
    for (index = 0; index < options.length; index++) {
        option = $("<option/>").val(options[index]).text(options[index])

        $(dd).append($(option))
    }
    $("#groupKeyFields").append($(labelDiv))
    $("#groupKeyFields").append($(fieldDiv).append($(dd)))
    $("#groupKeyFields").append($(emptyDiv))
}

var questionGroupCount = 2;
async function addRemoveQuestionGroup(event, action) {

    // If action add then create new section for question
    if (action === 'add') {
        var textareaInput = $(`textarea[name=textareaQuestion${questionGroupCount - 1}]`)
        if (!textareaInput.val()) {
            swal({
                title: "Unable to add questions!",
                text: `Please insert question no. ${questionGroupCount - 1}`,
                icon: "warning",
                button: true,
            });
            return false;
        }

        // If more than one section of question then submit button name should be Submit Questions
        $('#submitQuestion').val('Submit Questions')


        // Limit 10 question per window
        if (questionGroupCount > 10) {
            swal({
                title: "Unable to add more question!",
                text: "Only 10 questions allow",
                icon: "warning",
                button: true,
            });
            return false;
        }

        let newQuestion = `<div style="margin: 30px;" id="questionBoxContainer${questionGroupCount}" class="row-local">
                  <div class="column-local">
                      <label>
                          <strong style="font-size: x-large;">Q${questionGroupCount}. </strong>
                          <label>
                              <textarea name="textareaQuestion${questionGroupCount}" cols="40" rows="2" spellcheck="true"
                                  style="margin-top: 0px; margin-bottom: 0px; height: 54px;" required placeholder="Please enter question"></textarea>
                          </label>
                      </label>
                  </div>
                  <div style="font-size: medium;" class="column-local">Options: YES,&nbsp;NO</div>
                  <div class="column-local">
                      <input name="checkboxQuestion${questionGroupCount}" type="checkbox">
                      <label style="font-size: medium;">
                          Is Mandatory
                      </label>
                  </div>
              </div>`

        $("#questionsBoxGroup").append(newQuestion)


        questionGroupCount++;

    }


    // If action remove then remove last section of question
    if (action === 'remove') {

        if (questionGroupCount == 2) {
            swal({
                title: "Unable to remove question!",
                text: "No more questions allow to remove",
                icon: "warning",
                button: true,
            });
            return false
        }

        // If only one section of question then submit button name should be Submit Question
        if (questionGroupCount === 3)
            $('#submitQuestion').val('Submit Question')

        questionGroupCount --
        $("#questionBoxContainer" + questionGroupCount).remove();


    }

    // If action submit then submit form of questions
    if (action === 'submit') {

        event.preventDefault()

        $("#savingmodal").modal({
            escapeClose: false,
            clickClose: false,
            showClose: false
        });

        let setQuestions = {}
        setQuestions.flowType = selectedProcess
        setQuestions.stepID = selectedStep
        let fieldValue = []
        let groupKeyFields = $("select.groupKey")
        
        for (index = 0; index < groupKeyFields.length; index++) {
            let fieldValueKeys = {}

            groupKeyValue = $("select#" + index).val()
            fieldValueKeys["label"] = groupKeyLabels[index]
            fieldValueKeys["value"] = groupKeyValue

            fieldValue.push(fieldValueKeys)
        }

        let queryChecklist = db.collection("Checklist")

        // fieldValue have key value pair of label & value
        fieldValue.map((item) => {
            setQuestions[item.label] = item.value
            queryChecklist = queryChecklist.where(item.label, '==', item.value)
        })
        
        // Is checklist exist of groupKeyFields
        var existChecklist = await queryChecklist.where('flowType', '==', selectedProcess).where('stepID', '==', selectedStep).get()

        let checklist = new Array()

        for (let i = 1; i < questionGroupCount; i++) {

            let textareaValue = $(`textarea[name=textareaQuestion${i}]`).val()

            // question mark for textarea value
            if (textareaValue) {

                textareaValue = textareaValue.split('')

                if (textareaValue[textareaValue.length - 1] !== '?')
                    textareaValue.push('?')

                textareaValue = textareaValue.join('')
            }

            let isMandatory = false;

            if ($(`input[name=checkboxQuestion${i}]`).is(":checked"))
                isMandatory = true


            checklist.push({

                options: [
                    'Yes',
                    'No'
                ],

                mandatory: isMandatory,
                question: textareaValue
            })
        }

        setQuestions.checklist = checklist

        // Add question in existing checklist
        if (existChecklist && !existChecklist.empty) {

            existChecklist.docs.map(async (item) => {

                let checklistQuestions = item.data()['checklist'] ? item.data()['checklist'] : []

                // Join existing and created question, new question always be insert from last
                checklistQuestions.push(...checklist)

                // Insert checklist
                await db.collection("Checklist").doc(item.id).update({ checklist: checklistQuestions })
            })
        }

        // Create new set of checklist
        else
            await db.collection("Checklist").doc().set(setQuestions)

        // console.log("QUESTION SUBMIT")

        closeAllModals()

        // Form reset on submit
        $('form').each(function () {
            this.reset();
        });

    }
}

