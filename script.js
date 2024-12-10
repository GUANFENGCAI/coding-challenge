let jsonDataCache = null;
let valueShowText = document.getElementById('show-value-text');
const revenueBtn = document.getElementById('revenue-btn');
const expensesBtn = document.getElementById('expenses-btn');
const gpmBtn = document.getElementById('gpm-btn');
const npmBtn = document.getElementById('npm-btn');
const wcrBtn = document.getElementById('wcr-btn');


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
        revenue = data.filter(item => item.account_category === "revenue")
            .reduce((total, currentItem) => {return total+(currentItem.total_value || 0)}, 0);

        valueShowText.textContent = `${revenue} $`;
        return revenue;

    }catch(error){
        console.error("Error when calculating revenue:", error);
        alert("Error when calculating revenue");

    }
}


async function calculateExpenses(){
    try{
        const jsonData = await fetchJsonData();
        const data = jsonData.data;
        let expenses = 0;
        expenses = data
            .filter(item => item.account_category === "expense")
            .reduce((sum, currentItem) => sum + (currentItem.total_value || 0), 0);

        valueShowText.textContent = `${expenses} $`;
        return expenses;

    }catch(error){
        console.error("Error when calculating expenses:", error);
        alert("Error when calculating expenses");

    }
}

async function calculateGrossProfitMargin() {
    try{
        const jsonData = await fetchJsonData();
        const data = jsonData.data;
        let revenue = await calculateRevenue();
        if(revenue <=0 || !data || !Array.isArray(data)){
            console.error("Invalid revenue or data");
            return 0;
        }

        const totalSales = data.filter(item => item.account_type === "sales" && item.value_type === "debit")
            .reduce((sum, currentItem) => sum + (currentItem.total_value || 0), 0);

        console.log(totalSales);
        console.log(revenue);
        const gpm = (totalSales / revenue) * 100;
        valueShowText.textContent = `${gpm} %`;

    }catch (error){
        console.error("Error when calculating GPM:", error);
        alert("Error when calculating GPM");
    }
}

async function calculateNetProfitMargin() {
    try {
        const jsonData = await fetchJsonData();
        const data = jsonData.data;
        const revenue = await calculateRevenue();
        if (revenue <= 0 || !data || !Array.isArray(data)) {
            console.error("Invalid revenue or data");
            valueShowText.textContent = "Invalid data";
            return 0;
        }
        let expenses = await calculateExpenses();
        const netProfit = revenue - expenses;
        const netProfitMargin = (netProfit / revenue) * 100;
        valueShowText.textContent = `${netProfitMargin} %`;

        return netProfitMargin;


    }catch (error){
        console.error("Error when calculating NPM:", error);
        alert("Error when calculating NPM");
    }
}

async function calculateWCR(){
    try {

        const jsonData = await fetchJsonData();
        const data = jsonData.data;

        if (!data || !Array.isArray(data)) {
            console.error("Invalid data");
            valueShowText.textContent = "Invalid data";
            return 0;
        }

        const assetAdditions = data
            .filter(item =>
                item.account_category === "assets" &&
                item.value_type === "debit" &&
                ["current", "bank", "current_accounts_receivable"].includes(item.account_type)
            )
            .reduce((sum, currentItem) => sum + (currentItem.total_value || 0), 0);

        const assetSubtractions = data
            .filter(item =>
                item.account_category === "assets" &&
                item.value_type === "credit" &&
                ["current", "bank", "current_accounts_receivable"].includes(item.account_type)
            )
            .reduce((sum, currentItem) => sum + (currentItem.total_value || 0), 0);

        const assets = assetAdditions - assetSubtractions;

        const liabilityAdditions = data
            .filter(item =>
                item.account_category === "liability" &&
                item.value_type === "credit" &&
                ["current", "current_accounts_payable"].includes(item.account_type)
            )
            .reduce((sum, currentItem) => sum + (currentItem.total_value || 0), 0);

        const liabilitySubtractions = data
            .filter(item =>
                item.account_category === "liability" &&
                item.value_type === "debit" &&
                ["current", "current_accounts_payable"].includes(item.account_type)
            )
            .reduce((sum, currentItem) => sum + (currentItem.total_value || 0), 0);

        const liabilities = liabilityAdditions - liabilitySubtractions;

        if (liabilities === 0) {
            console.error("Liabilities are zero, cannot calculate ratio");
            valueShowText.textContent = "Invalid ratio";
            return;
        }

        const workingCapitalRatio = (assets / liabilities) * 100;
        valueShowText.textContent = `${workingCapitalRatio.toFixed(2)} %`;
    }catch (error){
        console.error("Error when calculating WCR:", error);
        alert("Error when calculating WCR");
    }
}

fetchJsonData('./data.json');
revenueBtn.addEventListener('click', ()=> {calculateRevenue()});
expensesBtn.addEventListener('click', ()=> {calculateExpenses()});
gpmBtn.addEventListener('click', ()=> {calculateGrossProfitMargin()});
npmBtn.addEventListener('click', ()=> {calculateNetProfitMargin()});
wcrBtn.addEventListener('click', ()=> {calculateWCR()});