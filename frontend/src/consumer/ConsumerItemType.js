import React, { useEffect, useState } from "react";

import ConsumerTopbar from "../components/ConsumerTopbar";
import ConsumerBottombar from "../components/ConsumerBottombar";
import ItemTypeCard from "../components/ItemTypeCard";

import itemType from "../fixed_data/item_type.json";

import woktossImage from "../resources/images/woktoss.gif";

function ConsumerItemType() {
    const [itemTypeApi, setItemTypeApi] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(process.env.REACT_APP_PROXY+'/api/itemtype');
                if (response.ok) {
                    const data = await response.json();
                    setItemTypeApi(data);
                }
                else {
                    console.log("response not ok");
                }
            }
            catch (error) {
                console.error('Network error:', error);
            }
        }
        fetchData();
    }, []);

    if(itemTypeApi) {
        let itemTypeCards = [];
        for(const [key, val] of Object.entries(itemType)) {
            let minPrice = Number.MAX_VALUE;
            val.item_type.forEach((it) => {
                if(minPrice>itemTypeApi[it]["price"]) minPrice = itemTypeApi[it]["price"];
            });
            itemTypeCards.push(<ItemTypeCard title={key} img={val.blob} desc={val.desc} cal={val.cal} minPrice={minPrice} />)
        }

        return (
            <div className="d-flex flex-column align-items-center atkinson">
                <ConsumerTopbar hasBackButton={false} title="Menu" />
                <ConsumerBottombar />
                <div className="d-grid grid-cols-3 justify-content-center align-items-center gap-6 w-fit px-5 pt-5 pb-8">
                    {itemTypeCards}
                </div>
            </div>
        );
    }
    else {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vw-100 vh-100">
                <img alt="Loading..." src={woktossImage} className="img-h-lg" />
            </div>
        );
    }
}

export default ConsumerItemType;