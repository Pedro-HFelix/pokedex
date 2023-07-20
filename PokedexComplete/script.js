class Pokemon {
    number;
    name;
    types = [];
    type;
    stats = {};
    photo;
  }
  
  const pokeApi = {};
  
  function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon();
    pokemon.number = pokeDetail.id;
    pokemon.name = pokeDetail.name;
  
    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
    const [type] = types;
    pokemon.types = types;
    pokemon.type = type;
  
    pokeDetail.stats.forEach((statsSlot) => {
      const statName = statsSlot.stat.name;
      const baseStat = statsSlot.base_stat;
      pokemon.stats[statName] = baseStat;
    });
  
    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default;
  
    return pokemon;
  }
  
  pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
      .then((response) => response.json())
      .then(convertPokeApiDetailToPokemon);
  };
  
  pokeApi.getPokemons = (offset = 0, limit = 1) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
  
    return fetch(url)
      .then((response) => response.json())
      .then((jsonBody) => jsonBody.results)
      .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
      .then((detailRequests) => Promise.all(detailRequests))
      .then((pokemonsDetails) => pokemonsDetails);
  };
  
  const pokemonList = document.getElementById('pokemonList');
  const loadMoreButton = document.getElementById('loadMoreButton');
  
  const maxRecords = 151;
  const limit = 10;
  let offset = 0;
  
  function convertToHtml(pokemon) {
    return `
      <li class="card pokemon ${pokemon.type}">
        <span class="number">#${pokemon.number}</span>
        <span class="name">${pokemon.name}</span>
        <div class="detail">
          <ol class="types">
            ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
          </ol>
          <ol class="stats">
            ${Object.entries(pokemon.stats).map(([statName, baseStat]) => `<li class="stat">${statName}: ${baseStat}</li>`).join('')}
          </ol>
          <img src="${pokemon.photo}" alt="${pokemon.name}">
        </div>
      </li>`;
  }
  
  function loadPokemonItems(offset, limit) {
    pokeApi.getPokemons(offset, limit)
      .then((pokemons = []) => {
        const newHtml = pokemons.map(convertToHtml).join('');
        pokemonList.innerHTML += newHtml;
      })
      .catch((error) => {
        console.error('Erro ao obter os Pokémon:', error);
      });
  }
  
  loadPokemonItems(offset, limit);
  
  loadMoreButton.addEventListener('click', () => {
    offset += limit;
    const qtdRecordsWithNextPage = offset + limit;
  
    if (qtdRecordsWithNextPage >= maxRecords) {
      const newLimit = maxRecords - offset;
      loadPokemonItems(offset, newLimit);
  
      loadMoreButton.parentElement.removeChild(loadMoreButton);
    } else {
      loadPokemonItems(offset, limit);
    }
  });
  