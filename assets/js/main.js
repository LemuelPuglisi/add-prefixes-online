const getAppTextArea = () => document.getElementById('app-textarea');

const getChoosenPrefix = () => {
    const plusOnPrefix  = document.getElementById('plus-on-prefix').checked; 
    const choosenPrefix = document.getElementById('prefix-select').value; 
    return plusOnPrefix ? `+${choosenPrefix}` : `${choosenPrefix}`; 
};

const sanitizeNumberList = (event) => {
    let $textarea = getAppTextArea();
    $textarea.value = $textarea.value
        .replace(',', "\n")
        .replace(/[^0-9\n]/g, '')
        .split('\n')
        .filter(number => number.length > 0)
        .join('\n');
}

const getNumbersWithPrefixes = (event) => {
    sanitizeNumberList();
    const prefix = getChoosenPrefix();
    return getAppTextArea().value
        .split('\n')
        .filter(number => number.length > 0)
        .map(number => prefix + number + ',')
        .join('\n');
}

const downloadResult = (event) => {
    const numberListWithPrefix = getNumbersWithPrefixes();

    if (numberListWithPrefix.length < 1) {
        alert('🚫 Inserisci almeno un numero.')
        return; 
    }

    let link = document.createElement('a');
    const data = 'data:text/plain;charset=utf-8,' + encodeURIComponent(numberListWithPrefix);
    link.setAttribute('href', data);
    link.setAttribute('download', 'numeri-con-prefisso.csv');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// countries and prefixes are loaded 
// from the previous script.
const addAllPrefixToSelect = () => {
    let countryPrefixMap = {}; 
    Object.keys(countries).forEach(key => {
        countryPrefixMap[key] = {}
        countryPrefixMap[key].name = countries[key]; 
        countryPrefixMap[key].prefix = prefixes[key]; 
    })    
    const $select = document.getElementById('prefix-select')
    Object.keys(countryPrefixMap).forEach(countryId => {
        const country = countryPrefixMap[countryId]
        let $option = document.createElement('option'); 
        $option.value = country.prefix; 
        $option.innerHTML = `${country.name} (${countryId}), +${country.prefix} `;          
        if (countryId == 'IT')
            $option.selected = true; 
        $select.appendChild($option) 
    })
}


addAllPrefixToSelect(); 

let $textarea = getAppTextArea();
$textarea.onkeyup = sanitizeNumberList;

// adding placeholder that requires newline 
// from javascript

$textarea.placeholder = "3402233777\n3402233888\n3402233999\n..."


let $submitButton = document.getElementById('submit');
$submitButton.onclick = downloadResult;