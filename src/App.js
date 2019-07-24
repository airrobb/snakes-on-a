import React, { useState, useEffect, useCallback, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";

import CursorImage from "./assets/images/cursor-snake2.png";
import Hiss from "./assets/audio/hissing.mp3";

import contentfulClient from "./contentful";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    cursor: url(${CursorImage}), auto;

  }

  html, body { 
    margin: 0;
    padding: 0;
  } 
`;

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  display: grid;
  align-content: center;
  justify-content: center;
  grid-gap: 3rem;
`;

const Image = styled.div`
  width: 40vw;
  height: 40vw;
  background-image: url(${({ src }) => src});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  display: inline-block;
  border: 2px solid black;

  @media (max-width: 767px) {
    width: 80vw;
    height: 70vw;
  }
`;

const Row = styled.div`
  display: grid;
  align-content: center;
  justify-content: center;
`;

const Button = styled.button`
  width: 15rem;
  text-transform: uppercase;
  font-size: 1.5rem;
  line-height: 3rem;
  border: 2px solid black;

  &:active,
  &:focus {
    outline: none;
  }
`;

const generateRandom = (max, current) => {
  const random = Math.floor(Math.random() * Math.floor(max));
  return current !== random ? random : generateRandom(current, max);
};

function App() {
  const [snakes, setSnakes] = useState([]);
  const [activeSnake, setActive] = useState();
  const audioRef = useRef();

  const getNewSnake = useCallback(() => {
    const max = Object.keys(snakes).length;
    audioRef.current.play();
    if (max > 1) {
      setActive(generateRandom(max, activeSnake));
    }
  }, [activeSnake, snakes, audioRef]);

  useEffect(() => {
    contentfulClient
      .getEntries()
      .then(snakes => {
        const parsed = snakes.items.map(({ fields }) => {
          const { image, ...snakeMeta } = fields;
          const {
            fields: { file }
          } = image;

          return {
            ...snakeMeta,
            url: `https:${file.url}`
          };
        });

        const snakeMap = {};

        parsed.forEach((snake, i) => {
          snakeMap[i] = snake;
        });
        setSnakes(snakeMap);
        setActive(generateRandom(parsed.length));
      })
      .catch(console.error);
  }, []);

  return (
    <React.Fragment>
      <GlobalStyle />
      <Wrapper>
        {snakes[activeSnake] && (
          <React.Fragment>
            <Row>
              <Image
                src={snakes[activeSnake].url}
                alt={snakes[activeSnake].flavorText}
                title={snakes[activeSnake].flavorText}
              />
            </Row>
            <Row>
              <Button onClick={getNewSnake}>Snakes</Button>
            </Row>
          </React.Fragment>
        )}
      </Wrapper>
      <audio src={Hiss} ref={audioRef} />
    </React.Fragment>
  );
}

export default App;
