const { isInScope } = require("./guardrails");
const { callLLM } = require("./llm");
const { checkCompatibility } = require("./tools/compatibility");


async function agentRouter(userMessage){
    //check if user question is in scope
    if (!isInScope(userMessage)){
        return "Sorry, I can only assist you with refridgerator and dishwasher related questions.";
    }

    //Intent of userMessage
    if (userMessage.toLowerCase().includes("install")){
        return callLLM ("Check part compatibility:" + userMessage);
    }


    if (userMessage.toLowerCase().includes("not working") || userMessage.includes("fix") ){
        return callLLM ("Troubleshooting instructions: " + userMessage);
    }

    //sample compatibility
    if (userMessage.toLowerCase().includes("compatible")) {
    const partRegex = /(ps\d+)/i;  // finds part numbers like PS11752778
    const modelRegex = /[a-z0-9]{5,}/i;  // simple model number regex

    const partMatch = userMessage.match(partRegex);
    const modelMatch = userMessage.match(modelRegex);

    if (partMatch && modelMatch) {
        const part = partMatch[1].toUpperCase();
        const model = modelMatch[0].toUpperCase();
        return checkCompatibility(part, model);
    }

    return "To check compatibility, please provide a part number and a model number.";
}


    else{
        return callLLM ("General Product help:" + userMessage);
    }

}

module.exports = {agentRouter}