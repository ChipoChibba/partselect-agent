# PartSelect AI Helper (Patsy)

An AI-powered assistant designed to help users search appliance replacement parts, check compatibility, and retrieve installation or troubleshooting instructions for refrigerators and dishwashers.

This project includes:
1. A Node.js backend with an LLM-augmented agent
2. A React frontend with a floating chat assistant
3. A curated dataset of refrigerator and dishwasher parts

## Features
1. Backend (Node.js / Express)
2. Product search with ranking, scoring, and symptom filtering
3. Direct lookup of part numbers (PSXXXXX format)
4. Model compatibility detection
5. Installation instructions (static + LLM fallback)
6. Troubleshooting recommendations
7. Intelligent intent classification using an LLM
8. Guardrails restricting interactions to refrigerators and dishwashers
9. Dataset stored locally in data/product_data.json


## Project Structure
```
project/
│
├── backend/
│   ├── agent/
│   │   ├── router.js
│   │   ├── guardrails.js
│   │   ├── classifyIntent.js
│   │   ├── llm.js
│   │   └── tools/
│   │       ├── search.js
│   │       ├── compatibility.js
│   │       ├── install.js
│   │       └── troubleshoot.js
│   ├── data/
│   │   └── product_data.json
│   ├── index.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── components/
    │   │   ├── ChatBotLauncher.jsx
    │   │   └── ChatWindow.jsx
    │   ├── api/
    │   │   └── api.js
    │   └── stylesheets/
    └── package.json
```

## Running the Backend

From within the ```backend/ `` directory:

``` 
cd backend
npm install
node index.js 
```


The backend starts at:

http://localhost:5000

## Manual Test Request

You can test the agent using curl:

```
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Find a refrigerator part for frost buildup"}'
```
Running the Frontend

From within the ```frontend/``` directory:
```
    cd frontend
    npm install
    npm start
```

The frontend will be available at:

http://localhost:3000


Note: A floating chat icon appears in the bottom-right corner. Clicking it opens the chat interface.

## Data Source

The dataset resides in:

```backend/data/product_data.json```


# Each entry contains:

1. Part number
2. Category
3. Manufacturer number
4. Description
5. Price
6. Fixable symptoms
7. Compatible models
8. Product page URL
9. You can extend this dataset as needed.

## Testing the Agent
```
Test the system using natural language queries such as:

“Find a refrigerator part for frost buildup.”

“Is PS10010001 compatible with WRS325FDAM04?”

“How do I install PS20020002?”

“My dishwasher is leaking.”

“Search for PS20020004.”

```

All routing, scoring, and response formatting occurs automatically.



## System Notes

The agent restricts itself to refrigerators and dishwashers.
Guardrails and fallback heuristics ensure irrelevant appliance requests are declined.
Installation logic uses both static instructions and LLM-generated output.
Compatibility supports:

- Part-to-model queries
- Model-to-part queries
- “What models does this part fit?”
- “What parts fit this model?”

Product search includes:

- Ranking
- Scoring
- Symptom prioritization
- Top-three result limiting

