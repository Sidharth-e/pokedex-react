import React, { useState, useEffect, useRef } from "react";
import styles from "./PokemonComponent.module.css";
import Modal from "react-modal";
import Loader from "../loader/loader";
import Stats from "../circlestats/stats";
import Heading from "../heading/heading";
const PokemonComponent = () => {
  const [pokemonData, setPokemonData] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [limit, setLimit] = useState(20);
  const [nextUrl, setNextUrl] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  // const [pokemonDetails, setPokemonDetails] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/?limit=20`
        );
        const data = await response.json();

        // Fetch additional details for each Pokemon
        const pokemonWithDetails = await Promise.all(
          data.results.map(async (pokemon) => {
            const response = await fetch(pokemon.url);
            return response.json();
          })
        );
        console.log(pokemonWithDetails);
        setPokemonData(pokemonWithDetails);
        setNextUrl(data.next);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchData();
  },[]);

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
          console.log("Error fetching more data:", error);
          setLoading(false);
          isFetching = false;
        }
      }
    };

    window.addEventListener("scroll", loadMoreData);
    return () => window.removeEventListener("scroll", loadMoreData);
  }, [nextUrl]);

  const handleCardClick = (pokemon) => {
    setSelectedPokemon(pokemon);
    setModalIsOpen(true);
  };
  useEffect(() => {
    // Function to toggle body scroll when the modal is open or closed
    const toggleBodyScroll = (enableScroll) => {
      const body = document.querySelector("body");
      body.style.overflow = enableScroll ? "auto" : "hidden";
    };

    if (modalIsOpen) {
      toggleBodyScroll(false); // Disable body scroll when modal is open
    } else {
      toggleBodyScroll(true); // Enable body scroll when modal is closed
    }

    // Clean up the effect to re-enable body scroll when the component unmounts
    return () => toggleBodyScroll(true);
  }, [modalIsOpen]);
  useEffect(() => {
    const fetchPokemonDetails = async () => {
      if (selectedPokemon) {
        try {
          const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${selectedPokemon.name}`
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
    // setPokemonDetails(null);
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

  return (
    <div ref={containerRef} className={styles.container}>
      <Heading/>
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
              {pokemon.types && (
                <>
                  <ul className={styles.typez}>
                    {pokemon.types.map((type) => (
                      
                      <li
                        className={styles.typezbutton}
                        style={{ backgroundColor: getColor(type.type.name) }}
                        key={type.type.name}
                      >
                        {type.type.name}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            {/* Add more details as needed */}
          </div>
        ))}
        {loading && <Loader />}
      </div>

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
            <button onClick={handleCloseModal} className={styles.closeButton}>
              Close
            </button>
            <div className={styles.modal}>
              <img
                className={styles.modalimage}
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${selectedPokemon.id}.gif`}
                alt={selectedPokemon.name}
              />
              <h2>{selectedPokemon.name}</h2>
              {selectedPokemon.types && (
                <>
                  <ul className={styles.typez}>
                    {selectedPokemon.types.map((type) => (
                      <li
                        className={styles.typezbutton}
                        style={{ backgroundColor: getColor(type.type.name) }}
                        key={type.type.name}
                      >
                        {type.type.name}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <h3>Ability</h3>
              <ul  className={styles.typez}>
              {selectedPokemon.abilities.map((ability) => (
                <li className={styles.typezbutton} style={{backgroundColor:'red'}} key={ability.ability.name}>
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
        )}
      </Modal>
    </div>
  );
};

export default PokemonComponent;
