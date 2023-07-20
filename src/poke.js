import React from 'https://esm.run/react@18';
import {
  useQuery,
  QueryClientProvider,
  QueryClient,
  useInfiniteQuery
} from 'https://esm.run/@tanstack/react-query@4';
import InfiniteScroll from 'https://esm.run/react-infinite-scroller@1';

const LANGUAGE = 'en';
const LIMIT = 50;

const queryClient = new QueryClient();

async function fetchUrl(url) {
  const response = await fetch(url);
  const result = await response.json();
  return result;
}

async function fetchPokemons({ pageParam = `https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}` }) {
  return fetchUrl(pageParam);
}

function getColor(type) {
  const colors = new Map([
    ['bug', '#a6b91a'],
    ['dark', '#705746'],
    ['dragon', '#6f35fc'],
    ['electric', '#f7d02c'],
    ['fairy', '#d685ad'],
    ['fighting', '#c22e28'],
    ['fire', '#ee8130'],
    ['flying', '#a98ff3'],
    ['ghost', '#735797'],
    ['grass', '#7ac74c'],
    ['ground', '#e2bf65'],
    ['ice', '#96d9d6'],
    ['normal', '#a8a77a'],
    ['poison', '#a33ea1'],
    ['psychic', '#f95587'],
    ['rock', '#b6a136'],
    ['steel', '#b7b7ce'],
    ['water', '#6390f0']
  ]);
  return colors.get(type) || '#777';
}

function Loader() {
  return <div>Loading …</div>;
}

function Error(props) {
  return <div {...props} />;
}

function Pokemon(props) {
  const { url } = props;

  const {
    data: pokemon,
    isLoading: pokemonIsLoading,
    isError: pokemonIsError,
    error: pokemonError
  } = useQuery(['pokemons', url], () => fetchUrl(url));

  const speciesUrl = pokemon?.species.url;

  const {
    data: species,
    isLoading: speciesIsLoading,
    isError: speciesIsError,
    error: speciesError
  } = useQuery(['species', speciesUrl], () => fetchUrl(speciesUrl), {
    enabled: !!speciesUrl
  });

  if (pokemonIsLoading || speciesIsLoading) {
    return <Loader />;
  }

  if (pokemonIsError) {
    return <Error>{pokemonError?.message}</Error>;
  }

  if (speciesIsError) {
    return <Error>{speciesError?.message}</Error>;
  }

  const { id, sprites, types } = pokemon;
  const { name } = species.names.find((name) => name.language.name === LANGUAGE);
  const color = getColor(types[0].type.name);
  const gradient = types.map((type) => getColor(type.type.name)).join(', ');
  const imageSize = 96;

  return (
    <div
      className="pokemon"
      style={{
        backgroundColor: color,
        backgroundImage: `linear-gradient(45deg, ${gradient})`
      }}
    >
      <h3 className="pokemon__name">{name}</h3>
      <span className="pokemon__id">{`#${id.toString().padStart(3, '0')}`}</span>
      <ol className="pokemon__types">
        {types.map((type) => (
          <li key={type.slot}>
            <span className="pokemon__type">{type.type.name}</span>
          </li>
        ))}
      </ol>
      <img alt={name} height={imageSize} src={sprites.front_default} width={imageSize} />
    </div>
  );
}

function App() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError
  } = useInfiniteQuery('pokemons', fetchPokemons, {
    getNextPageParam: (lastPage) => lastPage.next,
    getPreviousPageParam: (firstPage) => firstPage.previous
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <Error>{error?.message}</Error>;
  }

  return (
    <InfiniteScroll hasMore={hasNextPage} loadMore={fetchNextPage}>
      <h1>Pokedex</h1>
      <ol className="pokemons">
        {data?.pages.map((page, index) => (
          <React.Fragment key={`page-${index}`}>
            {page.results.map((pokemon) => (
              <li key={pokemon.url}>
                <Pokemon {...pokemon} />
              </li>
            ))}
          </React.Fragment>
        ))}
      </ol>
    </InfiniteScroll>
  );
}

function PokemonComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

export default PokemonComponent;
