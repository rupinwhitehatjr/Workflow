$(document).ready(function () {




})

$(document).on("authready", function (event) {

    //openWaitingModal()

    //displayWorkflow("CurriculumWorkflow");


});

$(document).on('change', '#process_selector', function () {
    if (!$("#stepNotifyList").hasClass("hide")) {
        $("#stepNotifyList").addClass("hide")
    }
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
    // stepsList = await db.collection(processName).where("onlyreview", '==', false).orderBy("index").get()
    processSteps = []
    let allStepsProcess = new Array()
    stepsList.forEach((doc) => {
        allStepsProcess.push(doc)
        // processSteps.push(doc)
        var validStepField = doc.data().fields ? doc.data().fields.filter(function (each) { return each.type === "dropdown"; }) : null;
        validStepField && validStepField.length > 0 ? processSteps.push(doc) : null
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

    createEmptyNotifyLists(allStepsProcess);

}

let questionListCounter = {}
//Create Empty Notify Lists, to be updated when the group key gets generated
function createEmptyNotifyLists(allStepsProcess) {
    $("#questionContainerForm").empty()
    numberofsteps = allStepsProcess.length

    for (stepIndex = 0; stepIndex < numberofsteps; stepIndex++) {
        questionListCounter[allStepsProcess[stepIndex].id] = 1
        // style="margin: 90px; padding: 5px;"
        var formContainer = `<div>
    <div style = "margin-bottom: 20px;" class="step">
                    <div class="stepheader">${allStepsProcess[stepIndex].data()['name']}</div>
                <div id=${allStepsProcess[stepIndex].id}>
                </div>
                <div class="checklist-form-wrapper">
            
                    <input class="button" onclick="addRemoveQuestionGroup(null, 'add', '${allStepsProcess[stepIndex].id}')" type="button" value="Add More Question"
                        id="addQuestionButton${stepIndex}">
                    <input class="button" onclick="addRemoveQuestionGroup(null, 'remove', '${allStepsProcess[stepIndex].id}')" type="button" value="Remove Question"
                        id="removeQuestionButton${stepIndex}">
                </div>
                </div>
                </div>
                <div class="clear"></div> 
                <div class="clear"></div>
                ${stepIndex === numberofsteps - 1 ? `<input style="float: right;" class="button" type='submit' id='submitQuestion' value="Save" />` : ''}`


        $("#questionContainerForm").append(formContainer)

        addRemoveQuestionGroup(null, 'add', allStepsProcess[stepIndex].id, null, true)


    }
}

// async function editViewPresentChecklist() {
//     let groupKeyFields = $("select.groupKey")

//         for (index = 0; index < groupKeyFields.length; index++) {
//             let fieldsValue = $("select#" + index).val()
//                 console.log(fieldsValue)            
//         }
// }


$(document).on('change', '#stepList', function () {
    selectedStep = $(this).val()
    if (selectedStep === "-1") {
        return 0
    }

    createGroupKeyChoices(selectedStep);


});


$(document).on('focus', 'select.groupKey', function () {
    let onTriggerDocument = new Array()
    let groupKeyFields = $("select.groupKey")

    for (index = 0; index < groupKeyFields.length; index++) {
        groupKeyValue = $("select#" + index).val()
        let indexOnTriggerDocument = {
            label: groupKeyLabels[index],
            value: groupKeyValue
        }
        onTriggerDocument.push(indexOnTriggerDocument)
    }
    // Store the current value on focus, before it changes
    $(document).on('change', 'select.groupKey', function () {

        let saveMsg = false

        let optionsID = new Array()

        $("textarea").each(function () {
            if (this.value !== '') {

                saveMsg = true

                optionsID.push($(this).attr("data-questionFormID"))
            }
        });

        if (saveMsg) {
            swal({
                title: "Form Save",
                text: "Do you want to save?",
                icon: "warning",
                buttons: true,
                buttons: ['Yes!', 'No!'],
            }).then((deny) => {
                if (deny) {
                    swal("Question form has been reset!");
                    $('form').each(function () {
                        this.reset();
                    });
                } else {
                    let isValidOption = true
                    optionsID.map((item) => {
                        if ($(`input[name=optionBoxQuestion${item}]`).val() === '') {

                            isValidOption = false
                            swal("Options are required!");
                        }
                    })
                    isValidOption ? addRemoveQuestionGroup(null, 'submit', null, onTriggerDocument) : null
                }
            });
        }

    });
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
        if (index === 0) {
            option = $("<option/>").val(options[index]).text(options[index]).attr('selected', 'true')
        }
        else {
            option = $("<option/>").val(options[index]).text(options[index])
        }

        $(dd).append($(option))
    }
    $("#groupKeyFields").append($(labelDiv))
    $("#groupKeyFields").append($(fieldDiv).append($(dd)))
    $("#groupKeyFields").append($(emptyDiv))
}

async function setInactiveCurrentChecklist(isOnChangeTriggerDocument) {
    try {
        for (IDCount in questionListCounter) {

            let queryChecklist = db.collection("Checklist")
            queryChecklist = queryChecklist.where("stepID", "==", IDCount)
            queryChecklist.flowType = selectedProcess
            let groupKeyFields = $("select.groupKey")

            for (index = 0; index < groupKeyFields.length; index++) {
                groupKeyValue = $("select#" + index).val()
                queryChecklist = queryChecklist.where(groupKeyLabels[index], '==', groupKeyValue)
            }

            if (isOnChangeTriggerDocument && isOnChangeTriggerDocument.length > 0) {
                for (let item in isOnChangeTriggerDocument) {
                    queryChecklist = queryChecklist.where(isOnChangeTriggerDocument[item].label, '==', isOnChangeTriggerDocument[item].label)
                }
            }

            let existChecklist = await queryChecklist.get()

            if (existChecklist && !existChecklist.empty) {

                existChecklist.docs.map(async (item) => {
                    await db.collection("Checklist").doc(item.id).update({ isActive: false })
                })
            }
        }
        return 0
    } catch (err) {
        console.log("ERROR ----->", err)
        return 0
    }
}

// Question form for new added question
function newQuestionForm(ID) {
    let newQuestion = `<div class="row-local">
            <div class="column-local">
              <label>
                <strong style="font-size: x-large;">Q${questionStepCounter[ID] - 1}. </strong>
                <label>
                  <textarea data-questionFormID=${ID + questionStepCounter[ID]} placeholder="Please enter question" name="textareaQuestion${ID + questionStepCounter[ID]}" cols="40"
                    rows="2" spellcheck="true" style="margin-top: 0px; margin-bottom: 0px; height: 54px;" required=""></textarea>
                </label>
              </label>
            </div>
            <label style="font-size: medium;" class="column-local">Answer choices: <input
                name="optionBoxQuestion${ID + questionStepCounter[ID]}" type="text" placeholder="Enter comma sperated options"
                required /></label>
            <div class="column-local">
              <input name="checkboxQuestion${ID + questionStepCounter[ID]}" type="checkbox">
              <label style="font-size: medium;">
                Is Mandatory
              </label>
            </div>
          </div>`

    $("#" + ID).append(newQuestion)
}

var questionGroupCount = 1;
let questionStepCounter = {}
async function addRemoveQuestionGroup(event, action, ID, isOnChangeTriggerDocument, isQuestionDynamic) {


    // If action add then create new section for question
    if (action === 'add') {

        if (!questionStepCounter[ID]) {
            questionStepCounter[ID] = 2
        }



        var textareaInput = $(`textarea[name=textareaQuestion${ID + questionListCounter[ID]}]`)
        var optionInput = $(`input[name=optionBoxQuestion${ID + questionListCounter[ID]}]`)
        if (textareaInput.length > 0 && !textareaInput.val()) {
            if(!isQuestionDynamic) {
                swal({
                    title: "Unable to add questions!",
                    text: `Please insert question no. ${questionStepCounter[ID] - 2}`,
                    icon: "warning",
                    button: true,
                });
            }
            return false;
        }

        if (optionInput.length > 0 && !optionInput.val()) {
            swal({
                title: "Unable to add questions!",
                text: `Answer choices can't be empty`,
                icon: "warning",
                button: true,
            });
            return false;
        }

        newQuestionForm(ID)

        // questionGroupCount++;
        questionStepCounter[ID]++
        questionListCounter[ID]++

    }


    // If action remove then remove last section of question
    if (action === 'remove') {

        if (questionGroupCount === 2) {
            swal({
                title: "Unable to remove question!",
                text: "No more questions allow to remove",
                icon: "warning",
                button: true,
            });
            return false
        }

        // questionGroupCount --
        questionStepCounter[ID]--
        questionListCounter[ID]--

        // $('#' + ID).children().last().remove()

        $('#' + ID).children().last().fadeOut(500, function () { $(this).remove(); });


    }

    // If action submit then submit form of questions
    if (action === 'submit') {


        if (event) {
            event.preventDefault()
        }

        $("#savingmodal").modal({
            escapeClose: false,
            clickClose: false,
            showClose: false
        });

        await setInactiveCurrentChecklist(isOnChangeTriggerDocument)
        

        for (IDCount in questionListCounter) {

            let setDocument = { isActive: true }

            setDocument.flowType = selectedProcess
            let groupKeyFields = $("select.groupKey")

            for (index = 0; index < groupKeyFields.length; index++) {
                groupKeyValue = $("select#" + index).val()
                setDocument[groupKeyLabels[index]] = groupKeyValue
            }

            if (isOnChangeTriggerDocument && isOnChangeTriggerDocument.length > 0) {
                for (let item in isOnChangeTriggerDocument) {
                    setDocument[isOnChangeTriggerDocument[item].label] = isOnChangeTriggerDocument[item].value
                }
            }

            setDocument.stepID = IDCount

            let questionList = questionListCounter[IDCount]

            let checklist = new Array()

            for (let i = 1; i < questionList + 1; i++) {

                let textareaValue = $(`textarea[name=textareaQuestion${IDCount + i}]`).val()

                // console.log("TEXT AREA ----->", textareaValue)

                // question mark for textarea value
                if (textareaValue) {

                    textareaValue = textareaValue.split('')

                    if (textareaValue[textareaValue.length - 1] !== '?')
                        textareaValue.push('?')

                    textareaValue = textareaValue.join('')
                    let isMandatory = false;
                    if ($(`input[name=checkboxQuestion${IDCount + i}]`).is(":checked"))
                        isMandatory = true

                    let optionValue = $(`input[name=optionBoxQuestion${IDCount + i}]`).val()
                    let options = optionValue.split(',')

                    checklist.push({

                        options: options,
                        mandatory: isMandatory,
                        question: textareaValue
                    })
                }
            }


            if (checklist.length > 0) {
                setDocument.checklist = checklist
                console.log("FINAL SET DOCUMENT ----->", setDocument)
                // Set document
                await db.collection("Checklist").doc().set(setDocument)
            }
        }

        closeAllModals()

        // Form reset on submit
        $('form').each(function () {
            this.reset();
        });

    }
}

