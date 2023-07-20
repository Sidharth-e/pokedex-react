import React, { useState, useEffect, useRef } from 'react';
import styles from './PokemonComponent.module.css';
import Modal from 'react-modal';
import Loader from '../loader/loader'
const PokemonComponent = () => {
  const [pokemonData, setPokemonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);
  const [nextUrl, setNextUrl] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [pokemonDetails, setPokemonDetails] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/?limit=${limit}`
        );
        const data = await response.json();
  
        // Fetch additional details for each Pokemon
        const pokemonWithDetails = await Promise.all(
          data.results.map(async (pokemon) => {
            const response = await fetch(pokemon.url);
            return response.json();
          })
        );
       console.log(pokemonWithDetails)
        setPokemonData(pokemonWithDetails);
        setNextUrl(data.next);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [limit]);

  useEffect(() => {
    let isFetching = false;
  
    const loadMoreData = async () => {
      if (!nextUrl || isFetching) return;
  
      const container = containerRef.current;
      const containerOffset = container.offsetTop + container.clientHeight;
      const scrollOffset = window.pageYOffset + window.innerHeight;
  
      if (scrollOffset > containerOffset) {
        try {
          isFetching = true;
          setLoading(true);
          const response = await fetch(nextUrl);
          const data = await response.json();
  
          // Ensure the 'results' property is available in the response
          if (data.results && data.results.length > 0) {
            // Fetch additional details for each Pokemon
            const pokemonWithDetails = await Promise.all(
              data.results.map(async (pokemon) => {
                const response = await fetch(pokemon.url);
                return response.json();
              })
            );
  
            // Update the state with the next set of Pokemon data
            setPokemonData((prevData) => [...prevData, ...pokemonWithDetails]);
            setNextUrl(data.next);
          } else {
            // If 'results' is not available or empty, consider it as the end of data
            setNextUrl(null);
          }
  
          setLoading(false);
          isFetching = false;
        } catch (error) {
          console.log('Error fetching more data:', error);
          setLoading(false);
          isFetching = false;
        }
      }
    };
  
    window.addEventListener('scroll', loadMoreData);
    return () => window.removeEventListener('scroll', loadMoreData);
  }, [nextUrl]);
  
  

  const handleCardClick = (pokemon) => {
    setSelectedPokemon(pokemon);
    setModalIsOpen(true);
  };
  

  useEffect(() => {
    const fetchPokemonDetails = async () => {
      if (selectedPokemon) {
        try {
          const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${selectedPokemon.name}`
          );
          const data = await response.json();
          console.log(data)
          setPokemonDetails(data);
        } catch (error) {
          console.log('Error fetching Pokemon details:', error);
        }
      }
    };

    fetchPokemonDetails();
  }, [selectedPokemon]);

  const handleCloseModal = () => {
    setSelectedPokemon(null);
    setModalIsOpen(false);
    setPokemonDetails(null);
  };
  const getColor = (type) => {
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
      ['water', '#6390f0'],
    ]);
    return colors.get(type) || '#777';
  };

  return (
    <div ref={containerRef} className={styles.container}>
      <h1>Pokemon List</h1>
      <div className={styles.pokemongrid}>
      {pokemonData.map((pokemon) => (
    <div
      key={pokemon.name}
      className={styles.pokemoncard}
      onClick={() => handleCardClick(pokemon)}
      style={{ backgroundColor: getColor(pokemon.types[0].type.name) }}
    >
      <img
        className={styles.image}
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
        alt={pokemon.name}
      />
      <div className={styles.pokedata}>
      <p>{pokemon.name}</p>
      <p>ID: {pokemon.id}</p>
      </div>
      {/* Add more details as needed */}
    </div>
  ))}
        {loading && <Loader/>}
      </div>

      <Modal
  isOpen={modalIsOpen}
  onRequestClose={handleCloseModal}
  contentLabel="Pokemon Details"
  className={styles.modal}
>
  {selectedPokemon && (
    <div className={styles.modalcontainer}>
      <button onClick={handleCloseModal} className={styles.closeButton}>
        Close
      </button>
      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${selectedPokemon.id}.gif`}
        alt={selectedPokemon.name}
      />
      <h2>{selectedPokemon.name}</h2>
      <p>ID: {selectedPokemon.id}</p>
      <p>Height: {selectedPokemon.height}</p>
      <p>Weight: {selectedPokemon.weight}</p>
      {/* Add more details as needed */}
      {selectedPokemon.types && (
        <>
          <h3>Types:</h3>
          <ul>
            {selectedPokemon.types.map((type) => (
              <li key={type.type.name}>{type.type.name}</li>
            ))}
          </ul>
        </>
      )}
      {/* Add more details as needed */}
    </div>
  )}
</Modal>

    </div>
  );
};

export default PokemonComponent;
