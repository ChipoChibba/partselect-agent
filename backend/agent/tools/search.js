const fs = require("fs");
const path = require("path");

function searchProducts(query) {
     try{
            const filePath = path.join(__dirname,"..", "..","data","product_data.json") // making path
    
            //check if file is valid 
            if (!fs.existsSync(filePath)){
                throw new Error(`Product Date file not found for part: ${query}`);
            }
    
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));//get data
            console.log("DATA KEYS:", Object.keys(data));
            console.log("RAW DATA:", data);

            // normalize text
            const cleaned = query.toLowerCase().replace(/[^a-z0-9 ]/g, "");
            const keywords = cleaned.split(" ").filter(Boolean);

            console.log("Keywords:", keywords);

            // compare keywords to product data
            const entries = Object.entries(data); // [ [key, value], ... ]

            const results = entries.filter(([partNumber, item]) => {
                const haystack = `${partNumber} ${item.title} ${item.description} ${item.category}`
                    .toLowerCase();

                return keywords.some((word) => haystack.includes(word));
            }).map(([partNumber, item]) => ({
                partNumber,
                ...item
            }));


            // check if any results found
            if (results.length === 0) {
                return `No products found matching your query: "${query}". Please try different keywords.`;
            }

            //find better way to do search results formatting
            const formatted = results
            .map(
                (r) => `### 🔧 ${r.title}

            **Part Number:** ${r.partNumber}  
            **Category:** ${r.category}  
            **Description:** ${r.description}  
            **Price:** $${r.price}

            ---`
            )
            .join("\n\n");

            return formatted;
        }

    catch(err){
        console.log("Error reading installation file", err.message);
        throw new Error();
    }
}

module.exports = { searchProducts };