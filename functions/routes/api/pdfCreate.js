function pdfCreate(metadata) {
    let pdfCreateData = [
        {
          content: `Asset Type ------> ${metadata.workflowDetails['Asset Type']}`,
          x: 70,
          y: 50,
          size: 20

        },
        {
          content: `Class ------> ${metadata.workflowDetails['Class']}`,
          x: 70,
          y: 60,
          size: 20

        },
        {
          content: `Curriculum ------> ${metadata.workflowDetails['Curriculum']}`,
          x: 70,
          y: 70,
          size: 20

        },
        {
          content: `Version ------> ${metadata.workflowDetails['Version']}`,
          x: 70,
          y: 80,
          size: 20

        },
        {
          content: `Step Owner ------> ${metadata.workflowDetails['step_owners']}`,
          x: 70,
          y: 90,
          size: 20

        },
        {
          content: `Flow Type ------> ${metadata.workflowDetails['flowType']}`,
          x: 70,
          y: 100,
          size: 20

        },
        {
          content: `Creator Name ------> ${metadata.workflowCreatedBy['name']}`,
          x: 70,
          y: 110,
          size: 20

        },
        {
          content: `Creator Email ------> ${metadata.workflowCreatedBy['email']}`,
          x: 70,
          y: 120,
          size: 20

        },
        {
          content: `Name of downloaded by ------> ${metadata.downloadedPdfBy['name']}`,
          x: 70,
          y: 130,
          size: 20

        },
        {
            content: `Email of downloaded by ------> ${metadata.downloadedPdfBy['email']}`,
            x: 70,
            y: 140,
            size: 20
  
        }
      ]

      return pdfCreateData
}

                    
module.exports = {
    pdfCreate: pdfCreate
}
