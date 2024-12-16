import Duggbase from "../models/Duggbase";
const express = require("express");
const OpenAI = require("openai");
require("dotenv").config({ path: "./.env" });

const router = express.Router();

async function getContext() {
    try {
        const db = await Duggbase();
        let response = {entree: new Array<Object>(), side: new Array<Object>(), appetizer: new Array<Object>(), drink: new Array<Object>()};

        const result = await db.query("SELECT uniqueid, name, premium, side, appetizer, drink FROM menu_items WHERE uniqueid!=0 AND NOT removed");
        result.rows.forEach((e) => {
            // If side
            if(e[3]) {
                response.side.push({
                    uniqueid: e[0],
                    name: e[1],
                    premium: e[2]
                });
            }
            // If appetizer
            else if(e[4]) {
                response.appetizer.push({
                    uniqueid: e[0],
                    name: e[1],
                    premium: e[2]
                });
            }
            // If drink
            else if(e[5]) {
                response.drink.push({
                    uniqueid: e[0],
                    name: e[1],
                    premium: e[2]
                });
            }
            // If entree
            else {
                response.entree.push({
                    uniqueid: e[0],
                    name: e[1],
                    premium: e[2]
                });
            }
        });

        db.end();

        return `
        You are tasked with identifying and extracting a customer's order based on their speech input, which has been transcribed by voice recognition software. Your goal is to infer the most likely order from the speech and return the selected items' unique IDs in the exact format required. You will not be able to interact with the user after receiving the input.

        Guidelines:
        Item Type Identification: The user may only order one item type at a time. If the user tries to order multiple item type's, then consider only the first one. Based on the items they mention, determine the correct item type and structure their order accordingly. The six possible item types are:

        Bowl: 1 Side + 1 Entree (uniqueid 6)
        Plate: 1 Side + 2 Entrees (uniqueid 7)
        Bigger Plate: 1 Side + 3 Entrees (uniqueid 8)
        A La Carte: Individual Entrees & Sides (uniqueid 1)
        Appetizers: Small and Large appetizers (uniqueid 9)
        Drinks: Various drink options (uniqueid 16)

        Inferences and Corrections:

        If the user makes a vague or unclear request, you must infer their intent. For example:
        "I want some orange stuff" means they likely want the item with uniqueid 6 (The Original Orange Chicken)
        "I'm not sure what I want, just give me anything" means you should randomly select a complete order based on the rules.
        If a user orders an impossible combination (e.g., ordering more sides or entrees than the chosen item type allows), adjust the order to make it valid. For example, if a Plate is chosen but they order 7 entrees, select a reasonable combination of 2 entrees.

        Data Validation:

        The response must always be in the comma-separated format of unique IDs:
        item type uniqueid, side uniqueid, entree uniqueid(s)

        For example, for a "Plate" order with Fried Rice, The Original Orange Chicken, and Grilled Teriyaki Chicken, the correct output is:
        "7,26,6,9"

        Clarification and Handling Errors:

        If the user mentions something that might be a misheard or misinterpreted phrase (e.g., "syringe stuff" which could be a mishearing of "orange stuff"), correct it based on phonetic similarity or context and select the appropriate menu item's uniqueid.
        If the user attempts to disrupt the system by asking irrelevant questions or giving incomplete instructions, simply return a random order from the available menu items.

        Menu Data:

        The menu items are predefined, and you must select from these exact options. There is no need for further customization, and all options must adhere to the available items in the two provided JSONs for entrees, sides, and item types.
        All Possible Menu Items:

        Item Types:
        {
            "Bowl": {
                "item_type": ["bowl"],
                "categories": ["side", "entree"],
                "desc": "1 Side & 1 Entree",
                "side_count": 1,
                "entree_count": 1,
                "cal": "280-1130",
                "uniqueid": 6
            },
            "Plate": {
                "item_type": ["plate"],
                "categories": ["side", "entree"],
                "desc": "1 Side & 2 Entrees",
                "side_count": 1,
                "entree_count": 2,
                "cal": "430-1640",
                "uniqueid": 7
            },
            "Bigger Plate": {
                "item_type": ["bigger_plate"],
                "categories": ["side", "entree"],
                "desc": "1 Side & 3 Entrees",
                "side_count": 1,
                "entree_count": 3,
                "cal": "580-2150",
                "uniqueid": 8
            },
            "A La Carte": {
                "item_type": ["small_entree", "medium_entree", "large_entree", "medium_side", "large_side"],
                "categories": ["side", "entree"],
                "desc": "Individual Entrees & Sides",
                "cal": "130-620",
                "uniqueid": 1
            },
            "Appetizers": {
                "item_type": ["roll", "large_roll", "rangoon", "large_rangoon", "small_apple", "med_apple", "large_apple"],
                "categories": ["appetizer"],
                "desc": "Appetizers & More",
                "cal": "150",
                "uniqueid": 9
            },
            "Drinks": {
                "item_type": ["small_drink", "med_drink", "large_drink", "water_bottle", "gatorade"],
                "categories": ["drink"],
                "desc": "Refreshing Beverage",
                "cal": "0-570",
                "uniqueid": 16
            }
        }

        Entrees:
        {
            "entree": ${JSON.stringify(response.entree)}
        }

        Sides:
        {
            "side": ${JSON.stringify(response.side)}
        }

        Appetizers:
        {
            "appetizer": ${JSON.stringify(response.appetizer)}
        }

        Drinks:
        {
            "drink": ${JSON.stringify(response.drink)}
        }

        Constraints:
        The items in the responses must always correspond exactly to the unique IDs listed in the provided JSONs.
        No additional explanations should be provided. Only the ordered items' unique IDs in the comma-separated list should be returned. No quotation marks should surround the response. Double check that your response strictly adheres to the requirements of the identified item type.
        If the input is unclear or the user doesn't specify enough, use your best judgment to choose a full and valid order based on the item type identified.

        Example:
        If the user says: "I want orange chicken and fried rice" (which likely means they want a "Bowl" with "The Original Orange Chicken" and "Fried Rice"), your response should be: "6,26,6"

        If the user says: "I want a plate with two entrees and a side of chow mein," your response should be: "7,24,6,9"

        If the user says: "Just give me anything," you should pick a random order, for example: "8,32,6,5,4"
        `;
    } catch (error) {
        console.error('Error fetching menu items:', error);
    }
}

async function getResponse(message : string) {
  const key = process.env.OPENAI_API_KEY;
  const openai = new OpenAI({ apiKey: key });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: await getContext() 
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return completion.choices[0].message.content;
}

router.post("/message", async (req : any, res : any) => {
    const { message } = req.body;
  
    try {
      const response = await getResponse(message);
      res.json({ response });
      console.log(response);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request." });
    }
});

module.exports = router;