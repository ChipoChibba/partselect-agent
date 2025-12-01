const fs = require("fs");
const path = require("path");

function getInstallInstructions(partNumber){
    try{
        const filePath = path.join(__dirname,"..", "..","data","install_instructions.json") // making path

        //check if file is valid 
        if (!fs.existsSync(filePath)){
            throw new Error(`Installation file not found for part: ${partNumber}`);
        }

           //if path is valid 
        else{
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));//get data

            if (!data[partNumber]){ // check if partNumber info in the database
                return `Sorry, we don't currently have installation instructions for part ${partNumber}.`;

            }

            //convert data arr to Markdown
            const steps = data[partNumber]
            .map(step => `- ${step}`)
            .join("\n");

            return `### Installation Instructions for ${partNumber}\n\n${steps}`;
        }       
    }

    catch(err){
        console.log("Error reading installation file", err.message);
        throw new Error;
    }
}

module.exports = { getInstallInstructions };