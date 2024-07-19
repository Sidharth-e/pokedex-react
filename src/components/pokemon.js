import React, { useState, useEffect, useRef } from "react";
import styles from "./PokemonComponent.module.css";
import Modal from "react-modal";
import Loader from "./loader/loader";
import Stats from "./circlestats/stats";
import Heading from "./heading/heading";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const PokemonComponent = () => {
  const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
  const [pokemonData, setPokemonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const limit = 15;
  const [page, setPage] = useState(1);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}?limit=${limit}&offset=${(page - 1) * limit}`);
        const data = await response.json();
        // Fetch additional details for each Pokemon
        const pokemonWithDetails = await Promise.all(
          data.results.map(async (pokemon) => {
            const response = await fetch(pokemon.url);
            return response.json();
          })
        );
        setPokemonData(pokemonWithDetails);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchData();
  }, [page, limit]);

  const handleCardClick = (pokemon) => {
    setSelectedPokemon(pokemon);
    setModalIsOpen(true);
  };

  useEffect(() => {
    const toggleBodyScroll = (enableScroll) => {
      const body = document.querySelector("body");
      body.style.overflow = enableScroll ? "auto" : "hidden";
    };

    if (modalIsOpen) {
      toggleBodyScroll(false); // Disable body scroll when modal is open
    } else {
      toggleBodyScroll(true); // Enable body scroll when modal is closed
    }

    return () => toggleBodyScroll(true);
  }, [modalIsOpen]);

  useEffect(() => {
    const fetchPokemonDetails = async () => {
      if (selectedPokemon) {
        try {
          const response = await fetch(
            `${baseUrl}/${selectedPokemon.name}`
          );
          const data = await response.json();
          console.log(data);
        } catch (error) {
          console.log("Error fetching Pokemon details:", error);
        }
      }
    };

    fetchPokemonDetails();
  }, [selectedPokemon]);

  const handleCloseModal = () => {
    setSelectedPokemon(null);
    setModalIsOpen(false);
  };

  const getColor = (type) => {
    const colors = new Map([
      ["bug", "#a6b91a"],
      ["dark", "#705746"],
      ["dragon", "#6f35fc"],
      ["electric", "#f7d02c"],
      ["fairy", "#d685ad"],
      ["fighting", "#c22e28"],
      ["fire", "#ee8130"],
      ["flying", "#a98ff3"],
      ["ghost", "#735797"],
      ["grass", "#7ac74c"],
      ["ground", "#e2bf65"],
      ["ice", "#96d9d6"],
      ["normal", "#a8a77a"],
      ["poison", "#a33ea1"],
      ["psychic", "#f95587"],
      ["rock", "#b6a136"],
      ["steel", "#b7b7ce"],
      ["water", "#6390f0"],
    ]);
    return colors.get(type) || "#777";
  };

  const filteredPokemonData = pokemonData.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setNoResults(filteredPokemonData.length === 0);
  }, [filteredPokemonData]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div ref={containerRef} className={styles.container}>
          <Heading />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Pokemon"
            className={styles.searchInput}
          />
          <div className={styles.pokemongrid}>
            {filteredPokemonData.map((pokemon) => (
              <div
                key={pokemon.name}
                className={styles.pokemoncard}
                onClick={() => handleCardClick(pokemon)}
                style={{
                  backgroundColor: getColor(pokemon.types[0].type.name),
                }}
              >
                <img
                  className={styles.image}
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                  alt={pokemon.name}
                />
                <div className={styles.pokedata}>
                  <p>ID: {pokemon.id}</p>
                  <p>{pokemon.name}</p>
                  {pokemon.types && (
                    <ul className={styles.typez}>
                      {pokemon.types.map((type) => (
                        <li
                          className={styles.typezbutton}
                          style={{
                            backgroundColor: getColor(type.type.name),
                          }}
                          key={type.type.name}
                        >
                          {type.type.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
          {noResults && !loading && (
            <div className={styles.noResultsMessage}>
              No results found. Try a different query or fetch more Pokemon.
            </div>
          )}

          <Stack spacing={2} className={styles.pagination}>
            <Pagination
              count={Math.ceil(1118 / limit)} // Assuming there are 1118 Pokemon in total
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Stack>

          <Modal
            isOpen={modalIsOpen}
            onRequestClose={handleCloseModal}
            contentLabel="Pokemon Details"
          >
            {selectedPokemon && (
              <div
                className={styles.modalcontainer}
                style={{
                  backgroundColor: getColor(selectedPokemon.types[0].type.name),
                }}
              >
                <button
                  onClick={handleCloseModal}
                  className={styles.closeButton}
                >
                  Close
                </button>
                <div className={styles.modal}>
                  <img
                    className={styles.modalimage}
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`}
                    alt={selectedPokemon.name}

                    style={{
                      filter: `drop-shadow(30px 10px 4px ${getColor(selectedPokemon.types[0].type.name)})`
                    }}
                  />
                  <div className={styles.modalDetails}>
                  <h2 className={styles.pokename}>{selectedPokemon.name}</h2>
                  {selectedPokemon.types && (
                    <ul className={styles.typez}>
                      {selectedPokemon.types.map((type) => (
                        <li
                          className={styles.typezbutton}
                          style={{
                            backgroundColor: getColor(type.type.name),
                          }}
                          key={type.type.name}
                        >
                          {type.type.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  <h3>Ability</h3>
                  <ul className={styles.typez}>
                    {selectedPokemon.abilities.map((ability) => (
                      <li
                        className={styles.typezbutton}
                        style={{ backgroundColor: "red" }}
                        key={ability.ability.name}
                      >
                        {ability.ability.name}
                        {ability.is_hidden && <span> (Hidden)</span>}
                      </li>
                    ))}
                  </ul>
                  <div className={styles.pokedetailscontainer}>
                    <div className={styles.pokedetails}>
                      <p>Height: </p>
                      <p>{selectedPokemon.height}</p>
                    </div>
                    <div className={styles.pokedetails}>
                      <p>Weight: </p>
                      <p>{selectedPokemon.weight}</p>
                    </div>
                  </div>
                  <div className={styles.pokemonstats}>
                    {selectedPokemon.stats.map((stat) => (
                      <Stats
                        key={stat.stat.name}
                        percentage={stat.base_stat}
                        color="blue"
                        name={
                          stat.stat.name.charAt(0).toUpperCase() +
                          stat.stat.name.slice(1)
                        }
                      />
                    ))}
                  </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}
    </>
  );
};

export default PokemonComponent;
