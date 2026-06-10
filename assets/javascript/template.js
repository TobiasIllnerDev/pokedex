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

function showPokemonTypes(typeName) {
    return `
        <span class="type-badge" style="background-color: ${colours[typeName]}">
            ${typeName}
        </span>
    `;
}

function showPokemonDetailDialogTemplate(pokemon, typesHTML, backgroundStyle, bgImagesHTML) {
    return `
        <div class="dialog-card-wrapper" style="${backgroundStyle}">
            
            ${bgImagesHTML}

            <div class="dialog-header">
                <div class="dialog-img-wrap">
                    <img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg" alt="${pokemon.name}" />
                </div>
                <h2>Nr. ${pokemon.id} - ${pokemon.name}</h2>
                <div class="dialog-typ-wrap">
                    ${typesHTML}
                </div>
            </div>
            
            <div class="dialog-tabs">
                <button class="tab-btn active" onclick="switchTab('infos')">Infos</button>
                <button class="tab-btn" onclick="switchTab('stats')">Stats</button>
                <button class="tab-btn" onclick="switchTab('evo')">Evolution</button>
            </div>

            <div class="dialog-body-fixed">
                <div id="tab-content-container"></div>
            </div>
        </div>
    `;
}

function showDialogInfoTemplate(heightInMeters, weightInKilos, baseExperience, abilitiesHTML) {
    return `
        <div class="tab-content">
            <p><strong>Height:</strong> ${heightInMeters} m</p>
            <p><strong>Weight:</strong> ${weightInKilos} kg</p>
            <p><strong>Base Exp:</strong> ${baseExperience}</p>
            <p><strong>Abilities:</strong> ${abilitiesHTML}</p>
        </div>
    `;
}

function showDialogStatRowTemplate(statName, statValue, typeColor) {
    return `
        <div class="stat-row">
            <span class="stat-name">${statName.toUpperCase()}</span>
            <span class="stat-value">${statValue}</span>
            <div class="stat-bar-bg">
                <div class="stat-bar-fill" style="width: ${(statValue / 255) * 100}%; background-color: ${typeColor};"></div>
            </div>
        </div>
    `;
}
function showDialogEvoItemTemplate(id, name) {
    return `
        <div class="evo-item" onclick="handlePokemonClick(${id})">
            <img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${id}.svg" alt="${name}" />
            <p>${name}</p>
        </div>
    `;
}