function isInScope(question){

    // list of words in scope
    const allowed = [
        "fridge",
        "refrigerator",
        "dishwasher",
        "part",
        "install",
        "installation",
        "model",
        "compatible",
        "ice maker",
        "leaking",
        "broken",
        "not working",
        "fix",
        "troubleshoot",
        "repair",
        "search",
        "find",
    ]

    return allowed.some(word => question.toLowerCase().includes(word));
}

module.exports =  { isInScope };