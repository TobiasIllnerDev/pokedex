const MAX_POKEMON = 151;
const listWrapper = document.getElementById("list-wrapper");
const searchInput = document.getElementById("search-input");
const numberFilter = document.getElementById("number");
const nameFilter = document.getElementById("name");
const notFoundMessage = document.getElementById("not-found-message");
const typeFilter = document.getElementById("typ-wrap");
const loadMoreBtn = document.getElementById("load-more-btn");

let allPokemons = [];
let currentDisplayedCount = 20;

let currentStartId = 1;
let currentEndId = 151;

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
}

function displayPokemons(pokemons) {
    let htmlContent = ""; 

    pokemons.forEach(pokemon => {
        const pokemonID = pokemon.url.split("/")[6];
        htmlContent += showPokemonTemplate(pokemon, pokemonID);
    });

    listWrapper.innerHTML = htmlContent;

    const renderedItems = listWrapper.getElementsByClassName("list-item");

    pokemons.forEach((pokemon, i) => {
        const pokemonID = pokemon.url.split("/")[6];
        loadPokemonsDetails(pokemonID, renderedItems[i]);
    });
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

function loadMorePokemons() {
    currentDisplayedCount += 40;

    if (currentDisplayedCount >= allPokemons.length) {
        currentDisplayedCount = allPokemons.length;
        loadMoreBtn.classList.add("hidden");
    }

    const pokemonsToDisplay = allPokemons.slice(0, currentDisplayedCount);
    displayPokemons(pokemonsToDisplay);
}

function changeGeneration(genNumber) {
    if (genNumber === 1) loadPokemons(1, 151);
    if (genNumber === 2) loadPokemons(152, 251);
    if (genNumber === 3) loadPokemons(252, 386);
    if (genNumber === 4) loadPokemons(387, 493);
    if (genNumber === 5) loadPokemons(494, 649);
}

loadMoreBtn.addEventListener("click", loadMorePokemons);

const colours = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
    steel: '#B7B7CE', fairy: '#D685AD',
};

loadPokemons(1, 151);