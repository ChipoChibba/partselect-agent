const { isInScope } = require("./guardrails");
const { callLLM } = require("./llm");
const { checkCompatibility } = require("./tools/compatibility");
const { getInstallInstructions} = require("./tools/install");
const { getTroubleshootInstructions } = require("./tools/troubleshoot");


async function agentRouter(userMessage){
    //check if user question is in scope
    if (!isInScope(userMessage)){
        return "Sorry, I can only assist you with refridgerator and dishwasher related questions.";
    }

    //Intent of userMessage
    if (userMessage.toLowerCase().includes("install") || userMessage.toLowerCase().includes("installation") ){
        const partRegex = /(ps\d{5,})/i;// finds part numbers like PS11752778

         //Match 
        const partMatch = userMessage.match(partRegex);
        console.log({ partMatch }); //dbug

        //check if partMatch exists
        if (partMatch){
            const part = partMatch[0].toUpperCase();
            console.log({ part });

            //call getInstallInstructions 
            return getInstallInstructions(part);
        }

        return "{ partMatch } is not valid. Please provide valid part number. "
    }


    if (userMessage.toLowerCase().includes("not working") || userMessage.toLowerCase().includes("fix") ){
        return getTroubleshootInstructions(userMessage);
    }

    //sample compatibility
    if (userMessage.toLowerCase().includes("compatible")) {
    const partRegex = /(ps\d{5,})/i;// finds part numbers like PS11752778
    const modelRegex = /\b(?!(PS))(?=[A-Z]*\d)(?=[A-Z0-9]{4,})[A-Z0-9]+\b/i; // simple model number regex

    const partMatch = userMessage.match(partRegex);
    const modelMatch = userMessage.match(modelRegex);

    if (partMatch && modelMatch) {
        const part = partMatch[1].toUpperCase();
        const model = modelMatch[0].toUpperCase();
        //console.log({part}, {model}); // debugging
        return checkCompatibility(part, model);
    }

    return "To check compatibility, please provide a part number and a model number.";
}

    else{
        return callLLM ("General Product help:" + userMessage);
    }

}

module.exports = {agentRouter}