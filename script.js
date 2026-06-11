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

let allPokemons = [];
let currentDisplayedCount = 20;
let currentOpenedPokemon = null;

let currentStartId = 1;
let currentEndId = 151;


function showLoader() {
    document.getElementById("loading").classList.remove("hidden");
}


function hideLoader() {
    document.getElementById("loading").classList.add("hidden");
}


async function loadPokemons(startId = 1, endId = 151) {
    currentStartId = startId;
    currentEndId = endId;
    currentDisplayedCount = 20;

    const limit = endId - startId + 1;
    const offset = startId - 1;

    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
        );
        const data = await response.json();
        allPokemons = data.results;
        loadMoreBtn.classList.remove("hidden");

        displayPokemons(allPokemons.slice(0, currentDisplayedCount));
    } catch (error) {
        console.error("Fehler beim Laden der Pokémon:", error);
    }
    finally {
        hideLoader();
    }
}


async function displayPokemons(pokemons, append = false) {
    let htmlContent = ""; 

    pokemons.forEach(pokemon => {
        const pokemonID = pokemon.url.split("/")[6];
        htmlContent += showPokemonTemplate(pokemon, pokemonID);
    });

    if (append) {
        listWrapper.innerHTML += htmlContent;
    } else {
        listWrapper.innerHTML = htmlContent;
    }

    const renderedItems = listWrapper.getElementsByClassName("list-item");

    const startIndex = append ? renderedItems.length - pokemons.length : 0;

    const detailPromises = pokemons.map((pokemon, i) => {
        const pokemonID = pokemon.url.split("/")[6];
        return loadPokemonsDetails(pokemonID, renderedItems[startIndex + i]);
    });

    return Promise.all(detailPromises);
}


async function loadPokemonsDetails(id, cardElement) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();    
        if (cardElement && data.types) {
            const targetDiv = cardElement.querySelector(".typ-wrap");         
            if (targetDiv) {
                let typesHTML = "";       
                for (let i = 0; i < data.types.length; i++) {
                    const typeName = data.types[i].type.name;
                    typesHTML += showPokemonTypes(typeName);
                }
                targetDiv.innerHTML = typesHTML;
            }
        }
    } catch (error) {
        console.error("Fehler beim Laden der Pokémon-Details:", error);
    }
}


function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (searchTerm === "") {
        displayPokemons(allPokemons.slice(0, currentDisplayedCount));
        notFoundMessage.classList.add("hidden");
        loadMoreBtn.classList.remove("hidden");
        notFoundText.classList.add("hidden")
        return;
    }

    let filteredPokemons = [];

    if (numberFilter.checked) {
        filteredPokemons = allPokemons.filter((pokemon) => {
            const pokemonID = pokemon.url.split("/")[6];
            loadMoreBtn.classList.add("hidden");
            return pokemonID.startsWith(searchTerm);
        });
    }

    if (nameFilter.checked) {
        if (searchTerm.length < 3) {
            notFoundText.classList.remove("hidden");
            return;
        }
        else {
            notFoundText.classList.add("hidden");
        }
        loadMoreBtn.classList.add("hidden");
        notFoundText.classList.add("hidden");
        filteredPokemons = allPokemons.filter((pokemon) =>
            pokemon.name.toLowerCase().includes(searchTerm)
        
        );
    }

    displayPokemons(filteredPokemons);

    if (filteredPokemons.length === 0) {
        notFoundMessage.classList.remove("hidden");
    } else {
        notFoundMessage.classList.add("hidden");
    }
}


async function handlePokemonClick(pokemonID) {
    showLoader();
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonID}`);
        const pokemonData = await response.json();
        currentOpenedPokemon = pokemonData;

        let typesHTML = "";
        for (let i = 0; i < pokemonData.types.length; i++) {
            typesHTML += showPokemonTypes(pokemonData.types[i].type.name);
        }

        let backgroundStyle = "";
        let bgImagesHTML = "";
        
        const type1 = pokemonData.types[0].type.name;
        const color1 = colours[type1];

        if (pokemonData.types.length === 2) {
            const type2 = pokemonData.types[1].type.name;
            const color2 = colours[type2];
            backgroundStyle = `background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%);`;
            bgImagesHTML = `
                <img src="./assets/pokemon-icons/${type1}.png" class="bg-type-icon icon-left" alt="" />
                <img src="./assets/pokemon-icons/${type2}.png" class="bg-type-icon icon-right" alt="" />
            `;
        } else {
            backgroundStyle = `background-color: ${color1};`;
            bgImagesHTML = `
                <img src="./assets/pokemon-icons/${type1}.png" class="bg-type-icon icon-single" alt="" />
            `;
        }

        dialogContent.innerHTML = showPokemonDetailDialogTemplate(pokemonData, typesHTML, backgroundStyle, bgImagesHTML);
        renderInfosTab();
        detailDialog.showModal();
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


async function renderEvoTab() {
    const container = document.getElementById("tab-content-container");
    container.innerHTML = "<p class='evo-loading'>Loading evolutions...</p>";

    try {
        const speciesResp = await fetch(currentOpenedPokemon.species.url);
        const speciesData = await speciesResp.json();
        
        const evoResp = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoResp.json();

        let evoHTML = '<div class="evo-container">';
        let currentChain = evoData.chain;

        while (currentChain) {
            const pokeName = currentChain.species.name;
            const pokeId = currentChain.species.url.split("/")[6];
            
            evoHTML += showDialogEvoItemTemplate(pokeId, pokeName);
            
            currentChain = currentChain.evolves_to[0];
        }

        evoHTML += '</div>';
        container.innerHTML = evoHTML;
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


async function loadMorePokemons() {
    showLoader(); 
    try {
        const oldDisplayCount = currentDisplayedCount;
        currentDisplayedCount += 20;

        if (currentDisplayedCount >= allPokemons.length) {
            currentDisplayedCount = allPokemons.length;
            loadMoreBtn.classList.add("hidden");
        }
        const newPokemonsToDisplay = allPokemons.slice(oldDisplayCount, currentDisplayedCount);
        await displayPokemons(newPokemonsToDisplay, true); 
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