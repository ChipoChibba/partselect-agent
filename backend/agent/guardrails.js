function isInScope(question){

    // list of words in scope
    const allowed = [
        "fridge",
        "refrigerator",
        "dishwasher",
        "part",
        "installation",
        "model",
        "compatible",
        "ice maker",
        "leaking",
        "broken",
        "not working",
    ]

    return allowed.some(word => question.toLowerCase().includes(word));
}

module.exports =  { isInScope };