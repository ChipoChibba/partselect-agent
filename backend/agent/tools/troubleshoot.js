const fs = require("fs");
const path = require("path");

function getTroubleshootInstructions(issueDescription){
    try{

        const filePath = path.join(__dirname, "..", "..","data","troubleshooting.json") // making path

        //check if filepath is valid
        if (!fs.existsSync(filePath)){
            throw new Error(`Troubleshoot file not found for issue: ${issueDescription}`);
        }

        //get data if path is valid
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        const instructions = data[issueDescription.toUpperCase()];

        //check if there are instructions for the issue
        if (!instructions){
            return `Sorry, we don't currently have troubleshooting instructions for the issue: ${issueDescription}.`;
        }

        else{
            //convert data arr to Markdown
            const steps = instructions
            .map(step => `- ${step}`)
            .join("\n");

            return `### Troubleshooting Instructions for Issue: ${issueDescription}\n\n${steps}`;
        }
    }
    catch(err){
        console.log("Error reading troubleshoot file", err.message);
        throw new Error;
    }
}
module.exports = { getTroubleshootInstructions };