import React, { useState, useEffect, useRef } from 'react';
import styles from './PokemonComponent.module.css';
import Modal from 'react-modal';

const PokemonComponent = () => {
  const [pokemonData, setPokemonData] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [limit, setLimit] = useState(20);
  const [nextUrl, setNextUrl] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [pokemonDetails, setPokemonDetails] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/?limit=20`
        );
        const data = await response.json();
        setPokemonData(data.results);
        setNextUrl(data.next);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const loadMoreData = async () => {
      if (!nextUrl) return;
      const container = containerRef.current;

      const containerOffset = container.offsetTop + container.clientHeight;
      const scrollOffset = window.pageYOffset + window.innerHeight;

      if (scrollOffset > containerOffset) {
        try {
          setLoading(true);
          const response = await fetch(nextUrl);
          const data = await response.json();
          setPokemonData((prevData) => [...prevData, ...data.results]);
          setNextUrl(data.next);
          setLoading(false);
        } catch (error) {
          console.log('Error fetching more data:', error);
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

  return (
    <div ref={containerRef} className={styles.container}>
      <h1>Pokemon List</h1>
      <div className={styles.pokemongrid}>
        {pokemonData.map((pokemon) => (
          <div
            key={pokemon.name}
            className={styles.pokemoncard}
            onClick={() => handleCardClick(pokemon)}
          >
            <img
              className={styles.image}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                pokemon.url.split('/')[6]
              }.png`}
              alt={pokemon.name}
            />
            <p>{pokemon.name}</p>
          </div>
        ))}
        {loading && <p>Loading more data...</p>}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Pokemon Details"
        className={styles.modal}
      >
        {selectedPokemon && (
          <div
          className={styles.modalcontainer}
          >
            <button onClick={handleCloseModal} className={styles.closeButton}>
              Close
            </button>
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                selectedPokemon.url.split('/')[6]
              }.png`}
              alt={selectedPokemon.name}
            />
            <h2>{selectedPokemon.name}</h2>
            {pokemonDetails ? (
              <>
                <p>Height: {pokemonDetails.height}</p>
                <p>Weight: {pokemonDetails.weight}</p>
                <p>Base Experience: {pokemonDetails.base_experience}</p>
                <h3>Types:</h3>
            <ul>
              {pokemonDetails.types.map((type) => (
                <li key={type.type.name}> {type.type.name}
                </li>
              ))}
            </ul>
                <h3>Ability:</h3>
                <ul>
  
              {pokemonDetails.abilities.map((ability) => (
                <li key={ability.ability.name}>
                   {ability.ability.name}
                  {ability.is_hidden && <span> (Hidden)</span>}
                </li>
              ))}
            </ul>
            <h3>Stats:</h3>
            
            <ul>
              {pokemonDetails.stats.map((stat) => (
                <li key={stat.stat.name}>
                  {stat.stat.name.charAt(0).toUpperCase() +
                    stat.stat.name.slice(1)}: {stat.base_stat}
                </li>
              ))}
            </ul>
            <ul>
              {pokemonDetails.abilities.map((ability) => (
                <li key={ability.ability.name}>
                  Ability: {ability.ability.name}
                  {ability.is_hidden && <span> (Hidden)</span>}
                </li>
              ))}
            </ul>
            <h3>Moves:</h3>
            <ul>
              {pokemonDetails.moves.map((move) => (
                <li key={move.move.name}>{move.move.name}
                </li>
              ))}
            </ul>

            

                {/* Additional details */}
              </>
            ) : (
              <p>Loading details...</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PokemonComponent;
