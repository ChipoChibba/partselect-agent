const { isInScope } = require("./guardrails");
const { callLLM } = require("./llm");

async function agentRouter(userMessage){
    //check if user question is in scope
    if (!isInScope(userMessage)){
        return "Sorry, I can only assist you with refridgerator and dishwasher related questions.";
    }

    //Intent of userMessage
    if (userMessage.includes("install")){
        return callLLM ("Check part compatibility:" + userMessage);
    }

    if (userMessage.includes("compatible")){
        return callLLM ("General Product help: " + userMessage);
    }

    if (userMessage.includes("not working") || userMessage.includes("fix") ){
        return callLLM ("Troubleshooting instructions: " + userMessage);
    }

    else{
        return callLLM ("General Product help:" + userMessage);
    }

}

module.exports = {agentRouter}