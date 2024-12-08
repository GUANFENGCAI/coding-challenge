let jsonDataCache = null;
let valueShowText = document.getElementById('show-value-text');
const revenueBtn = document.getElementById('revenue-btn');

async function fetchJsonData(dataName){
    if(jsonDataCache != null){
        console.log("Using cache data");
        return jsonDataCache;
    }
    try {
        const response = await fetch(dataName);
        jsonDataCache = await response.json();
        console.log("JSON file successfully loaded");

        return jsonDataCache;
    }catch(error){
        console.error("Error when reading JSON file",error);
        throw new Error("Failed to fetch JSON data");
    }
}


async function calculateRevenue(){
    try{
        const jsonData = await fetchJsonData();
        const data = jsonData.data;
        let revenue = 0;
        data.filter(item => item.account_category)
            .reduce((total, currentItem) => {return total+(currentItem.total_value || 0)}, revenue);

        valueShowText.textContent = `{revenue} $`;

    }catch(error){
        console.error("Error when calculating revenue:", error);
        alert("Error when calculating revenue");

    }
}

//fetchJsonData('data.json');
//revenueBtn.addEventListener('click', ()=> {calculateRevenue()});
