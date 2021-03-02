$(document).ready(function(){

    

});





gprocessName=null;

$(document).on("fieldsready", function(event){

    createFilterUI(filterFields);
    
});

filterFields=[]
async function fetchDataForProcess(processName)
{
    gprocessName=processName
    filterFields=[]
    $("#stepList").removeClass("standout");
    $("#stepList").empty()
    stepsList= await db.collection(processName)                        
                        .orderBy("index").get()
    //console.log(processName)
    processSteps=[]
   // console.log(stepsList)
    stepsList.forEach((doc)=>{
        processSteps.push(doc)
        //console.log(doc.data())
        collectSearchFields(doc.data());
    })

    $(document).trigger("fieldsready")


}

stepNameArray=[]
function collectSearchFields(processStep)
{
    //filterFields=[]
    //console.log(processSteps)
   // stepCount=processSteps.length
    
    stepName=processStep["name"]
    stepNameArray.push(stepName)
    if(!("fields" in processStep))
    {
        return;
    }
    fields=processStep["fields"];
    fieldCount=fields.length
    //console.log(fields)
    for(fieldIndex=0;fieldIndex<fieldCount;fieldIndex++)
    {
        fieldMeta=fields[fieldIndex]
        if(!("isSearchTerm" in fieldMeta))
        {
            continue;
        }
        isSearchTerm=fieldMeta["isSearchTerm"]
        if(isSearchTerm)
        {
         filterFields.push(fieldMeta)
        }

   }

   
  
}

function createFilterUI(fieldList)
{
    fieldCount=fieldList.length   
    for(index=0;index<fieldCount;index++)
    {
        createField(fieldList[index], index)
    }
    createStepField();
    $(".showExtraFilters").removeClass("showExtraFilters")
    $("#buttonsection").removeClass("invisible")
}

resultsList=[]
async function searchWorkflows()
{
    fieldList=filterFields;
    fieldCount=fieldList.length 
    executeQuery=true
    let query = db.collection("Workflows");
   
    for(index=0;index<fieldCount;index++)
    {
        //createField(fieldList[index], index)
        fieldLabel=fieldList[index]["label"]
        fieldValue=$("#"+index).val()
        if(fieldValue && fieldValue!=="")
        {
            executeQuery=true
           // console.log(fieldLabel)
           // console.log(fieldValue)
          query = query.where(fieldLabel, '==', fieldValue);  
        }
        
    }
    selectedStepName=$("#stepListDD").val()
    if(selectedStepName!="")
    {
        query = query.where("active_step_name", '==', selectedStepName); 
        executeQuery=true       
    }

    myactioncheckbox=$("#myactioncheckbox").is(":checked")
   // console.log(myactioncheckbox)
    if(myactioncheckbox)
    {
        user=firebase.auth().currentUser 
        
        query = query.where("step_owners", "array-contains", user.email)
        executeQuery=true
    }
     

    
    if(executeQuery)
    {
        //console.log("executing")
       // query=query.orderBy("updated_on", "asc")
        query = query.where("flowType", "==", gprocessName)
        results=await query.get()
        searchResultsCount=results.size
        //console.log(results[0])
        $("tr.row-data").remove()
        if(searchResultsCount>0)
        {
            
        }
        resultsList=[]
        results.forEach((doc)=>{
            //addRow(doc)
            resultsList.push(doc)

        })
        //sortResultsList(resultsList)
        resultsList.sort( compare );

        for(resultIndex=0;resultIndex<searchResultsCount;resultIndex++)
        {
            addRow(resultsList[resultIndex])
        }
        
    }
}

function compare( a, b ) {
  AdocData=a.data()
  BdocData=b.data()  
  if ( AdocData.updated_on < BdocData.updated_on ){
    return -1;
  }
  if ( AdocData.updated_on > BdocData.updated_on ){
    return 1;
  }
  return 0;
}



function addRow(doc)
{
    doc_data=doc.data()
    //console.log(doc_data)
    row=$("<tr/>").attr("class", "row-data");
    //curriculum=doc_data["Curriculum"]
    //version=doc_data["Version"]
    //classnumber=doc_data["Class"]
    asset=doc_data["Asset Type"]
    currentstep=doc_data["active_step_name"]
    currentstepid=doc_data["active_step_id"]
    actioners=doc_data["step_owners"]
    closed_status=doc_data["closed"]
    lastUpdatedDate=doc_data["updated_on"]
    //time_since_last_update=Date.now()-lastUpdatedDate

    dataKeyList=[]

    //console.log(doc_data)
    for(dindex=0;dindex<displaykey.length;dindex++)
    {
        displayKeyItem=displaykey[dindex]
        //cons
        if(displayKeyItem in doc_data)
        {
            //console.log(displayKeyItem)
            dataKeyList.push(doc_data[displayKeyItem])
        }
    }

    if(!actioners)
    {
        actioners=[]
    }
    time_since_last_update=humanized_time_span(lastUpdatedDate)
    //console.log(time_since_last_update)
    if(closed_status)
    {
        //console.log("adding Class")
        $(row).addClass("closed")
        currentstep="Closed"
    }
    
    /*goButton=$("<img/>").attr("class", "imgButton")
                        .attr("src", "img/go.png")*/

    /*$(viewFlowLink).append($(goButton)) */                   


    logLink= $("<a/>").attr("onclick", "javascript:viewLog('"+doc.id+"')")                      

    
    logButton=$("<img/>").attr("class", "imgButton")
                        
                        .attr("src", "../img/log.png")                    
    $(logLink).append($(logButton))  


    dataKey=dataKeyList.join("-")

    viewFlowLink=$("<a/>").attr("onclick", "javascript:openFlow('"+doc.id+"')")
                          .attr("class", "buttonsm")
                          .text(dataKey)
    $(row).append($("<td/>").append($(viewFlowLink)))

    $(row).append($("<td/>").text(asset))
    $(row).append($("<td/>").text(currentstep))
    $(row).append($("<td/>").text(time_since_last_update))
    actioncell=$("<td/>").attr("class","actioner")
    user=firebase.auth().currentUser                    
    for(index=0;index<actioners.length;index++)
    {
        actioner=$("<span/>").text(actioners[index])
                             .attr("class", "userdiv")
        

        if(index==0 &&  actioners[index].trim()===user.email && !closed_status)
        {
            editImg=$("<img/>").attr("src", "../img/pencil.png").attr("class","pencilimg")
            editspan=$("<span/>").attr("class", "pencilbutton")
                                 .attr("data-flow-id", doc.id)
                                 .attr("data-step-id", currentstepid)
                                 .attr("data-actioner", actioners[index])
                                 .attr("data-step-name", currentstep)

            $(editspan).append($(editImg))
            
            $(actioner).append($(editspan))
            $(actioner).addClass("stepowner")
        }
       
        //$(actioner).append('<span class="deletebutton"></span>')    
        $(actioncell).append($(actioner))
        $(actioncell).append($("<br/>"))
    }
    //actioners=actioners.join("</br>")
    
    $(row).append($(actioncell))

    actionButtonCell=$("<td/>")
    //$(actionButtonCell).append($(viewFlowLink))
    $(actionButtonCell).append($(logLink))
    $(row).append($(actionButtonCell))
    

   // console.log(dataKey)
    $("#resultstable").append($(row))
}

function openFlow(flowId)
{
    URL="/viewFlow.html?id="+flowId
    flowURL=getLinkFromBasePath(URL)
    //console.log(flowURL)
   window.open(flowURL)
}

$(document).on("click", ".pencilbutton", function(){
    
    userEmail=$(this).attr("data-actioner")
    flowID=$(this).attr("data-flow-id")
    stepID=$(this).attr("data-step-id")
    stepName=$(this).attr("data-step-name")
    inputHolder=createEditableInput(flowID,stepID,userEmail,stepName)    
    $(this).parent().hide()
    $(this).parent().after($(inputHolder))

})

$(document).on("click", ".crossimage", function(){
    
    $(this).parent().siblings(".userdiv").show()   
    $(this).parent().remove();
    
    //$(this).parent().after($(inputHolder))

})

$(document).on("click", ".saveimage", function(){
    
    stepID=$(this).attr("data-step-id");  
    flowID=$(this).attr("data-flow-id"); 
    newUserEmail=$(this).siblings("input").val()
    stepName=$(this).siblings("input").attr("data-step-name")
    OwnershipChangeData={}
    
    OwnershipChangeData["by"]=getLoggedInUserObject()// common.js
    OwnershipChangeData["timestamp"]=Date.now();
    OwnershipChangeData["stepID"]=stepID;
    OwnershipChangeData["flowID"]=flowID;
    OwnershipChangeData["newOwner"]=newUserEmail;
    OwnershipChangeData["stepName"]=stepName;
    

    //Update Ownership Change Document
    OwnershipChangeDocRef=db.collection("OwnershipChange").doc()    
    OwnershipChangeDoc=db.collection("OwnershipChange").doc(OwnershipChangeDocRef.id)    
    OwnershipChangeDoc.set(OwnershipChangeData)

    $(this).parent().siblings(".userdiv").show() 
    $(this).parent().siblings(".stepowner").html(newUserEmail)  
    $(this).parent().remove();
    
    
    
    //$(this).parent().after($(inputHolder))

})

function createEditableInput(flowID, stepID, user, stepName)
{
    holder=$("<span/>")
    userInput=$("<input/>").attr("placeholder", "Add New User") 
                                    .attr("class", "newuserinput")
                                    .val(user)

    crossImage=$("<img/>").attr("src", "../img/cross.png")
                          .attr("class", "actionbuttons crossimage")

    checkImage=$("<img/>").attr("src", "../img/save.png")
                          .attr("class", "actionbuttons saveimage")
    
    $(userInput).attr("data-step-id", stepID)
    $(userInput).attr("data-flow-id", flowID)
    $(userInput).attr("data-step-name", stepName)
    

    $(crossImage).attr("data-step-id", stepID)
    $(crossImage).attr("data-flow-id", flowID)

    $(checkImage).attr("data-step-id", stepID)
    $(checkImage).attr("data-flow-id", flowID)

    $(holder).append(userInput)
    $(holder).append(checkImage)    
    $(holder).append(crossImage)                                
    return holder; 
}











function createField(fieldMeta, index)
{
    type=fieldMeta["type"]
    label=fieldMeta["label"]
    
    fieldLabel=$('<div/>')
                .attr("class", "grid_4 fieldlabel")
                .append(label)
    $(fieldLabel).insertBefore("#myaction")

    
    if(type=="dropdown")
    {
        
        div=$('<div/>').attr("class", "grid_6 field")

        options=fieldMeta["options"];
       
        
        dd=$("<select/>")
                .attr("data-index", index)
                .attr("id", index)
                .attr("name", index)
              
        $(dd).append($("<option/>"))
        for(index=0;index<options.length;index++)
        {
            option=$("<option/>").val(options[index]).text(options[index])
            
            $(dd).append($(option))
        }
        $(div).append($(dd))
        $(div).insertBefore("#myaction")

        //Create a div to go to next line.
        

    }

    if(type==="range")
    {
        
        div=$('<div/>').attr("class", "grid_6 field")       
       
        
        dd=$("<select/>")                
                .attr("data-index", index)
                .attr("id", index)
                .attr("name", index)
             
        $(dd).append($("<option/>"))
        min=fieldMeta["min"];
        max=fieldMeta["max"];
        //console.log(min)
       // console.log(max)
        for(index=min;index<max+1;index++)
        {
            
            //console.log(index)
            option=$("<option/>").val(index).text(index)
           
            $(dd).append($(option))
        }
        $(div).append($(dd))
        $(div).insertBefore("#myaction")

        //Create a div to go to next line.
        

    }
    emptyDiv=$('<div/>').attr("class", "clear")
    $(emptyDiv).insertBefore("#myaction")
     //$("#filterFields").append()
}

function createStepField()
{
    
    

    fieldLabel=$('<div/>')
                .attr("class", "grid_4 fieldlabel")
                .append("Step Name")
    $(fieldLabel).insertBefore("#myaction")
    
        
        div=$('<div/>').attr("class", "grid_6 field")

        options=stepNameArray
       
        
        dd=$("<select/>").attr("id", "stepListDD")
                //.attr("id", index)
                //.attr("name", index)
              
        $(dd).append($("<option/>")) //Add a blank option
        for(index=0;index<options.length;index++)
        {
            option=$("<option/>").val(options[index]).text(options[index])
            
            $(dd).append($(option))
        }
        $(div).append($(dd))
        $(div).insertBefore("#myaction")
        

    
    
    emptyDiv=$('<div/>').attr("class", "clear")
    $(emptyDiv).insertBefore("#myaction")
}


function viewLog(flowID)
{
    
}
