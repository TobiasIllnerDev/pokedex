const MAX_POKEMON = 151;
const listWrapper = document.getElementById("list-wrapper");
const searchInput = document.getElementById("search-input");
const numberFilter = document.getElementById("number");
const nameFilter = document.getElementById("name");
const notFoundMessage = document.getElementById("not-found-message");
const typeFilter = document.getElementById("typ-wrap");
const loadMoreBtn = document.getElementById("load-more-btn");
const detailDialog = document.getElementById("pokemon-detail-dialog");
const dialogContent = document.getElementById("dialog-content");
const closeDialogBtn = document.getElementById("close-dialog-btn");
const notFoundText = document.getElementById("not-found-message-text");
const sortButton = document.getElementById("sort-button");
const filterMenu = document.getElementById("filter-menu");

let allPokemons = [];
let currentDisplayedCount = 20;
let currentOpenedPokemon = null;

let currentStartId = 1;
let currentEndId = 151;

sortButton.addEventListener("click", (event) => {
    event.stopPropagation(); 
    
    filterMenu.classList.toggle("hidden");
});

document.addEventListener("click", (event) => {
    if (!filterMenu.classList.contains("hidden") && !filterMenu.contains(event.target)) {
        filterMenu.classList.add("hidden");
    }
});

function showLoader() {
    document.getElementById("loading").classList.remove("hidden");
}


function hideLoader() {
    document.getElementById("loading").classList.add("hidden");
}

function getPokemonApiUrl(startId, endId) {
    currentStartId = startId;
    currentEndId = endId;
    currentDisplayedCount = 20;
    return `https://pokeapi.co/api/v2/pokemon?limit=${endId - startId + 1}&offset=${startId - 1}`;
}

async function loadPokemons(startId = 1, endId = 151) {
    const url = getPokemonApiUrl(startId, endId);
    try {
        const response = await fetch(url);
        const data = await response.json();
        allPokemons = data.results;
        loadMoreBtn.classList.remove("hidden");
        await displayPokemons(allPokemons.slice(0, currentDisplayedCount)); 
    } catch (error) {
        console.error("Fehler beim Laden:", error);
    } finally {
        hideLoader();
    }
}

function generatePokemonsHTML(pokemons) {
    return pokemons.map(p => showPokemonTemplate(p, p.url.split("/")[6])).join("");
}

function fetchRenderedDetails(pokemons, startIndex, renderedItems) {
    const promises = pokemons.map((pokemon, i) => {
        return loadPokemonsDetails(pokemon.url.split("/")[6], renderedItems[startIndex + i]);
    });
    return Promise.all(promises);
}

async function displayPokemons(pokemons, append = false) {
    const html = generatePokemonsHTML(pokemons);
    
    if (append) {
        listWrapper.insertAdjacentHTML("beforeend", html);
    } else {
        listWrapper.innerHTML = html;
    }
    
    const items = listWrapper.getElementsByClassName("list-item");
    const startIndex = append ? items.length - pokemons.length : 0;
    
    return fetchRenderedDetails(pokemons, startIndex, items);
}

function generateTypesHTML(types) {
    return types.map(t => showPokemonTypes(t.type.name)).join("");
}

async function loadPokemonsDetails(id, cardElement) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();    
        const targetDiv = cardElement?.querySelector(".typ-wrap");
        
        if (targetDiv && data.types) {
            targetDiv.innerHTML = generateTypesHTML(data.types);

            cardElement.style.setProperty('--type-color', `${colours[data.types[0].type.name]}AA`);
        }
    } catch (error) {
        console.error("Fehler beim Laden der Pokémon-Details:", error);
    }
}

function resetSearchUI() {
    displayPokemons(allPokemons.slice(0, currentDisplayedCount));
    notFoundMessage.classList.add("hidden");
    loadMoreBtn.classList.remove("hidden");
    notFoundText.classList.add("hidden");
}

function getFilteredPokemons(searchTerm) {
    if (numberFilter.checked) {
        return allPokemons.filter(p => p.url.split("/")[6].startsWith(searchTerm));
    }
    if (nameFilter.checked) {
        if (searchTerm.length < 3) return null;
        notFoundText.classList.add("hidden");
        return allPokemons.filter(p => p.name.toLowerCase().includes(searchTerm));
    }
    return [];
}

function updateSearchUI(filtered) {
    loadMoreBtn.classList.add("hidden");
    displayPokemons(filtered);
    notFoundMessage.classList.toggle("hidden", filtered.length > 0);
}

function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm === "") return resetSearchUI();

    const filtered = getFilteredPokemons(searchTerm);
    if (filtered === null) {
        if (loadMoreBtn.classList.contains("hidden")) resetSearchUI();
        notFoundText.classList.remove("hidden");
        return;
    }

    updateSearchUI(filtered);
}

function getDialogDesign(types) {
    const type1 = types[0].type.name;
    const color1 = colours[type1];
    if (types.length === 2) {
        const type2 = types[1].type.name;
        return {
            bgStyle: `background: linear-gradient(135deg, ${color1} 0%, ${colours[type2]} 100%);`,
            bgImages: `<img src="./assets/pokemon-icons/${type1}.png" class="bg-type-icon icon-left" alt="" /><img src="./assets/pokemon-icons/${type2}.png" class="bg-type-icon icon-right" alt="" />`
        };
    }
    return {
        bgStyle: `background-color: ${color1};`,
        bgImages: `<img src="./assets/pokemon-icons/${type1}.png" class="bg-type-icon icon-single" alt="" />`
    };
}

function setupAndShowDialog(data, typesHTML, design) {
    dialogContent.innerHTML = showPokemonDetailDialogTemplate(data, typesHTML, design.bgStyle, design.bgImages);
    renderInfosTab();
    detailDialog.showModal();
}

async function handlePokemonClick(pokemonID) {
    showLoader();
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonID}`);
        const pokemonData = await response.json();
        currentOpenedPokemon = pokemonData;

        const typesHTML = generateTypesHTML(pokemonData.types); // Nutzt die Hilfsfunktion von vorhin!
        const design = getDialogDesign(pokemonData.types);
        
        setupAndShowDialog(pokemonData, typesHTML, design);
    } catch (error) {
        console.error("Fehler beim Laden des Dialogs:", error);
    } finally {
        hideLoader();
    }
}

function renderInfosTab() {
    const container = document.getElementById("tab-content-container");
    const height = currentOpenedPokemon.height / 10;
    const weight = currentOpenedPokemon.weight / 10;
    
    let abilitiesHTML = [];
    for (let i = 0; i < currentOpenedPokemon.abilities.length; i++) {
        abilitiesHTML.push(currentOpenedPokemon.abilities[i].ability.name);
    }

    container.innerHTML = showDialogInfoTemplate(height, weight, currentOpenedPokemon.base_experience, abilitiesHTML.join(", "));
}

function renderStatsTab() {
    const container = document.getElementById("tab-content-container");
    let statsHTML = '<div class="stats-container">';

    const firstType = currentOpenedPokemon.types[0].type.name;
    const typeColor = colours[firstType];
    
    for (let i = 0; i < currentOpenedPokemon.stats.length; i++) {
        const statName = currentOpenedPokemon.stats[i].stat.name;
        const statValue = currentOpenedPokemon.stats[i].base_stat;
        statsHTML += showDialogStatRowTemplate(statName, statValue, typeColor);
    }
    statsHTML += '</div>';
    container.innerHTML = statsHTML;
}

async function fetchEvolutionChain(speciesUrl) {
    const speciesResp = await fetch(speciesUrl);
    const speciesData = await speciesResp.json();
    const evoResp = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoResp.json();
    return evoData.chain;
}

function generateEvoHTML(chain) {
    let evoHTML = '<div class="evo-container">';
    let currentChain = chain;
    while (currentChain) {
        const pokeName = currentChain.species.name;
        const pokeId = currentChain.species.url.split("/")[6];
        evoHTML += showDialogEvoItemTemplate(pokeId, pokeName);
        currentChain = currentChain.evolves_to[0];
    }
    return evoHTML + '</div>';
}

async function renderEvoTab() {
    const container = document.getElementById("tab-content-container");
    container.innerHTML = "<p class='evo-loading'>Loading evolutions...</p>";
    try {
        const chain = await fetchEvolutionChain(currentOpenedPokemon.species.url);
        container.innerHTML = generateEvoHTML(chain);
    } catch (error) {
        console.error("Fehler beim Laden der Evolutionen:", error);
        container.innerHTML = "<p>No evolution data found.</p>";
    }
}

function switchTab(tabName) {

    const buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(btn => btn.classList.remove("active"));

    const clickedBtn = event.target;
    clickedBtn.classList.add("active");
    if (tabName === 'infos') renderInfosTab();
    if (tabName === 'stats') renderStatsTab();
    if (tabName === 'evo') renderEvoTab();
}

closeDialogBtn.addEventListener("click", () => detailDialog.close());
detailDialog.addEventListener("click", (e) => {
    if (e.target === detailDialog) detailDialog.close();
});

function getSliceIndices() {
    const oldDisplayCount = currentDisplayedCount;
    currentDisplayedCount += 20;

    if (currentDisplayedCount >= allPokemons.length) {
        currentDisplayedCount = allPokemons.length;
        loadMoreBtn.classList.add("hidden");
    }
    return { start: oldDisplayCount, end: currentDisplayedCount };
}

async function loadMorePokemons() {
    showLoader(); 
    try {
        const indices = getSliceIndices();
        const newPokemons = allPokemons.slice(indices.start, indices.end);
        await displayPokemons(newPokemons, true); 
    } catch (error) {
        console.error("Fehler beim Erweitern der Liste:", error);
    } finally {
        hideLoader(); 
    }
}

function changeGeneration(genNumber) {
    if (genNumber === 1) loadPokemons(1, 151);
    if (genNumber === 2) loadPokemons(152, 251);
    if (genNumber === 3) loadPokemons(252, 386);
    if (genNumber === 4) loadPokemons(387, 493);
    if (genNumber === 5) loadPokemons(494, 649);
}

function getActivePokemonList() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm !== "" && searchTerm.length >= 3) {
        return getFilteredPokemons(searchTerm) || [];
    }
    return allPokemons;
}

function getNeighbourId(direction) {
    const list = getActivePokemonList();
    const currentIndex = list.findIndex(p => p.url.split("/")[6] == currentOpenedPokemon.id);
    if (currentIndex === -1) return currentOpenedPokemon.id;

    let nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= list.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = list.length - 1;

    return list[nextIndex].url.split("/")[6];
}

async function navigatePokemon(direction) {
    const nextId = getNeighbourId(direction);
    await handlePokemonClick(nextId);
}

function setupAndShowDialog(data, typesHTML, design) {
    dialogContent.innerHTML = showPokemonDetailDialogTemplate(data, typesHTML, design.bgStyle, design.bgImages);
    renderInfosTab();
    
    document.getElementById("dialog-prev-btn")?.addEventListener("click", () => navigatePokemon("prev"));
    document.getElementById("dialog-next-btn")?.addEventListener("click", () => navigatePokemon("next"));
    
    detailDialog.showModal();
}

const closeButton = document.getElementById("search-close-icon");

closeButton.addEventListener("click", () => {
    searchInput.value = "";
    displayPokemons(allPokemons.slice(0, currentDisplayedCount));
    loadMoreBtn.classList.remove("hidden");
    notFoundMessage.classList.add("hidden");
});


loadMoreBtn.addEventListener("click", loadMorePokemons);
searchInput.addEventListener("input", handleSearch);


const colours = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
    steel: '#B7B7CE', fairy: '#D685AD',
};


showLoader();
loadPokemons(1, 151);