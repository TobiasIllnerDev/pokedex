const MAX_POKEMON = 151;
const listWrapper = document.getElementById("list-wrapper");
const searchInput = document.getElementById("search-input");
const numberFilter = document.getElementById("number");
const nameFilter = document.getElementById("name");
const notFoundMessage = document.getElementById("not-found-message");

let allPokemons = [];

async function loadPokemons() {
    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`
        );

        const data = await response.json();

        allPokemons = data.results;
        displayPokemons(allPokemons);

    } catch (error) {
        console.error("Fehler beim Laden der Pokémon:", error);
    }
}

async function fetchPokemonDataBeforeRedirect(id) {
    try {
        const [pokemonResponse, speciesResponse] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
        ]);

        const pokemon = await pokemonResponse.json();
        const pokemonSpecies = await speciesResponse.json();

        return {
            pokemon,
            pokemonSpecies
        };

    } catch (error) {
        console.error(error);
        return null;
    }
}

function displayPokemons(pokemons) {
    listWrapper.innerHTML = "";
    let htmlContent = "";

    pokemons.forEach((pokemon) => {
        const pokemonID = pokemon.url.split("/")[6];
        htmlContent += showPokemonTemplate(pokemon, pokemonID);
    });

    listWrapper.innerHTML = htmlContent;
}


async function handlePokemonClick(id) {
    const data = await fetchPokemonDataBeforeRedirect(id);
    
    if (data) {
        console.log("Daten erfolgreich an handlePokemonClick übergeben!", data);
    }
}

const sortIcon = document.getElementById("sort-icon");
const filterWrapper = document.querySelector(".filter-wrapper");

filterWrapper.classList.add("hidden");
sortIcon.addEventListener("click", () => {
    filterWrapper.classList.toggle("hidden");
});

const colours = {
	normal: '#A8A77A',
	fire: '#EE8130',
	water: '#6390F0',
	electric: '#F7D02C',
	grass: '#7AC74C',
	ice: '#96D9D6',
	fighting: '#C22E28',
	poison: '#A33EA1',
	ground: '#E2BF65',
	flying: '#A98FF3',
	psychic: '#F95587',
	bug: '#A6B91A',
	rock: '#B6A136',
	ghost: '#735797',
	dragon: '#6F35FC',
	dark: '#705746',
	steel: '#B7B7CE',
	fairy: '#D685AD',
};
loadPokemons();