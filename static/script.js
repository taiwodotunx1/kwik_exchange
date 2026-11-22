const BASE_URL = '';

let rates = {};
let currencyNames = {};
let fromCurrency = 'USD';
let toCurrency = 'EUR';
let activeDropdown = null;

const fromAmount = document.getElementById('from-amount');
const toAmount = document.getElementById('to-amount');
const fromCode = document.getElementById('from-code');
const toCode = document.getElementById('to-code');
const fromFlag = document.getElementById('from-flag');
const toFlag = document.getElementById('to-flag');
const fromTrigger = document.getElementById('from-trigger');
const toTrigger = document.getElementById('to-trigger');
const swapBtn = document.getElementById('swap-btn');
const dropdown = document.getElementById('dropdown');
const searchInput = document.getElementById('search-input');
const currencyList = document.getElementById('currency-list');
const rateDisplay = document.getElementById('rate-display');
const lastUpdated = document.getElementById('last-updated');
const heroTitle = document.getElementById('hero-title');


function getFlagUrl(currencyCode) {
    const countryCode = currencyCode.slice(0, 2).toLowerCase();
    return `https://flagcdn.com/16x12/${countryCode}.png`;
}


async function fetchCodes() {
    try {
        const response = await fetch('/api/codes');
        if (!response.ok) throw new Error('Failed to fetch codes');
        const data = await response.json();
        data.codes.forEach(([code, name]) => {
            currencyNames[code] = name;
        });
    } catch (error) {
        console.error('Could not load currency names:', error);
    }
}


async function fetchRates(base) {
    try {
        const response = await fetch(`/api/rates/${base}`);
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        rates = data.rates;
        updateLastUpdated(data.last_updated);
        convert();
        updateRateDisplay();
        updateHeroTitle();
    } catch (error) {
        rateDisplay.textContent = 'Failed to load rates. Please try again later.';
        rateDisplay.style.color = 'red';
    }
}

function convert() {
    const amount = parseFloat(fromAmount.value);
    if (isNaN(amount) || amount < 0) {
        toAmount.value = '';
        return;
    }
    const rate = rates[toCurrency];
    toAmount.value = (amount * rate).toFixed(2);
}

function updateRateDisplay() {
    const rate = rates[toCurrency];
    rateDisplay.textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
}

function updateHeroTitle() {
    const fromName = currencyNames[fromCurrency] || fromCurrency;
    const toName = currencyNames[toCurrency] || toCurrency;
    heroTitle.textContent = `${fromAmount.value} ${fromCurrency} to ${toCurrency} - Convert ${fromName} to ${toName}`;
}

function updateLastUpdated(utcString) {
    const date = new Date(utcString);
    const formatted = date.toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    });
    lastUpdated.textContent = `Last updated: ${formatted}`;
}

function updateDisplay() {
    fromCode.textContent = fromCurrency;
    toCode.textContent = toCurrency;
    fromFlag.src = getFlagUrl(fromCurrency);
    fromFlag.alt = fromCurrency;
    toFlag.src = getFlagUrl(toCurrency);
    toFlag.alt = toCurrency;
}

function populateList(filter = '') {
    currencyList.innerHTML = '';
    const allCurrencies = Object.keys(rates);

    const filtered = allCurrencies.filter(code => {
        const name = currencyNames[code] || '';
        return (
            code.toLowerCase().includes(filter.toLowerCase()) ||
            name.toLowerCase().includes(filter.toLowerCase())
        );
    });

    if (filtered.length === 0) {
        currencyList.innerHTML = '<li style="color:#999; padding:10px 8px;">No currencies found</li>';
        return;
    }

    filtered.forEach(code => {
        const name = currencyNames[code] || code;
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${getFlagUrl(code)}" alt="${code}">
            <span><strong>${code}</strong> - ${name}</span>
        `;
        li.addEventListener('click', () => selectCurrency(code));
        currencyList.appendChild(li);
    });
}

// Select currency from dropdown
function selectCurrency(code) {
    if (activeDropdown === 'from') {
        fromCurrency = code;
        fetchRates(fromCurrency);
    } else {
        toCurrency = code;
        convert();
        updateRateDisplay();
        updateHeroTitle();
    }
    updateDisplay();
    closeDropdown();
}

// Open dropdown
function openDropdown(type) {
    activeDropdown = type;
    searchInput.value = '';
    populateList();
    dropdown.classList.add('open');
    searchInput.focus();
}

// Close dropdown
function closeDropdown() {
    dropdown.classList.remove('open');
    activeDropdown = null;
}


fromTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    activeDropdown === 'from' ? closeDropdown() : openDropdown('from');
});

toTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    activeDropdown === 'to' ? closeDropdown() : openDropdown('to');
});

document.addEventListener('click', () => closeDropdown());

dropdown.addEventListener('click', (e) => e.stopPropagation());

searchInput.addEventListener('input', () => populateList(searchInput.value));

fromAmount.addEventListener('input', () => {
    convert();
    updateHeroTitle();
});

swapBtn.addEventListener('click', () => {
    [fromCurrency, toCurrency] = [toCurrency, fromCurrency];
    updateDisplay();
    fetchRates(fromCurrency);
});

// Init — fetch codes first, then rates
async function init() {
    await fetchCodes();
    updateDisplay();
    await fetchRates(fromCurrency);
}

init();
