const MAX_POKEMON = 151;
const listWrapper = document.getElementById("list-wrapper");
const searchInput = document.getElementById("search-input");
const numberFilter = document.getElementById("number");
const nameFilter = document.getElementById("name");
const notFoundMessage = document.getElementById("not-found-message");
const typeFilter = document.getElementById("typ-wrap");
const loadMoreBtn = document.getElementById("load-more-btn");

let allPokemons = [];
let allPokemonMoreDetails = [];
let currentDisplayedCount = 20;

// fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
// fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)

async function loadPokemons() {
    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`

        );
        const data = await response.json();
        allPokemons = data.results;
        displayPokemons(allPokemons.slice(0, currentDisplayedCount));
        console.log(allPokemons[0])
    } catch (error) {
        console.error("Fehler beim Laden der Pokémon:", error);

    }
}

function displayPokemons(pokemons) {
    let htmlContent = "" 

    pokemons.forEach(pokemon => {
        const pokemonID = pokemon.url.split("/")[6];
        htmlContent += showPokemonTemplate(pokemon, pokemonID)
    });

    listWrapper.innerHTML = htmlContent;
}

function loadMorePokemons() {
    if (currentDisplayedCount === 20) {
        currentDisplayedCount += 40;
    } else {
        currentDisplayedCount += 40;
    }

    if (currentDisplayedCount >= MAX_POKEMON) {
        currentDisplayedCount = MAX_POKEMON;
        loadMoreBtn.classList.add("hidden");
    }

    const pokemonsToDisplay = allPokemons.slice(0, currentDisplayedCount);
    displayPokemons(pokemonsToDisplay);
}

const colours = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
    steel: '#B7B7CE', fairy: '#D685AD',
};

loadPokemons();