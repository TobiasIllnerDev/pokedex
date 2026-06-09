function showPokemonTemplate(pokemon, pokemonID) {
    return `
        <div class="list-item" onclick="handlePokemonClick(${pokemonID})">
            <div class="img-wrap">
                <img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemonID}.svg" alt="${pokemon.name}" />
            </div>
            <div class="number-wrap">
                <p class="caption-fonts">Nr. ${pokemonID}</p>
            </div>
            <div class="typ-wrap" id="typ-wrap"></div>
            <div class="name-wrap">
                <p class="body3-fonts">${pokemon.name}</p>
            </div>
        </div>
    `;
}

function showPokemonTypes(pokemon, pokeTypes) {
    return `
        <div class="types">
            <p>
    `
}