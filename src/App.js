import React, { useState, useEffect, useCallback, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";

import LoaderImage from "./assets/images/cursor-snake.png";
import CursorImage from "./assets/images/cursor-snake2.png";
import Hiss from "./assets/audio/hissing.mp3";
import Slither from "./assets/images/slither.svg";

import contentfulClient from "./contentful";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    font-family: Impact;
    cursor: url(${CursorImage}), auto;

  }

  html, body { 
    margin: 0;
    padding: 0;
  } 
`;

const Loader = styled.img`
  width: 30vmin;
  opacity: ${({ transition }) => (transition ? "1" : "0")}
  transition: all 0.5s;
`;

function Delay() {
  const [transition, setTransition] = useState(false);
  useEffect(() => {
    setTimeout(() => setTransition(true), 500);
  }, []);
  return <Loader transition={transition} />;
}

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  display: grid;
  align-content: center;
  justify-content: center;
  grid-gap: 8vmin;
`;

const insetFade = () => {
  const fade = [];

  for (let i = 0; i < 15; i += 1) {
    fade.push(`inset -${i / 2}px -${i / 2}px ${5 * i}px white`);
  }
  return `box-shadow: ${fade.join(", ")};`;
};

const Image = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${({ src }) => src});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  display: inline-block;
  ${insetFade}
`;

const POSITIONS = {
  top: `
    top: 1vmin;
    left: -1vmin;
    transform: translate(30.5vmin, -30.5vmin) rotate(90deg);

    @media (max-width: 767px) {
      height: 80vmin;
      top: -1vmin;
      transform: translate(41vmin, -41vmin) rotate(90deg);
    }
  `,
  bottom: `
    top: 2vmin;
    left: -1vmin;
    transform: translate(30.5vmin, 30vmin) rotate(90deg);

    @media (max-width: 767px) {
      height: 80vmin;
      top: 2vmin;
      transform: translate(41vmin, 40vmin)  rotate(90deg);
    }
  `,
  left: `
    top: 1vmin;
    left: -1vmin;
    @media (max-width: 767px) {
      left: -3vmin;
      height: 80vmin;
    }
  `,
  right: `
    top: 1vmin;
    left: -1vmin;
    transform: translateX(61vmin);

    @media (max-width: 767px) {
      height: 80vmin;
      transform: translateX(82vmin);
    }
  `
};

const getPosition = ({ position }) => POSITIONS[position];

const Slitherer = styled.div`
  width: 10px;
  height: 95%;
  background-image: url(${Slither});
  background-repeat: repeat-y;
  position: absolute;
  ${getPosition}
`;

const Container = styled.div`
  position: relative;
  width: 60vmin;
  height: 60vmin;

  @media (max-width: 767px) {
    width: 80vmin;
    height: 80vmin;
  }
`;

const Row = styled.div`
  display: grid;
  align-content: center;
  justify-content: center;
`;

const Button = styled.button`
  width: 20rem;
  text-transform: uppercase;
  font-size: 1.3rem;
  font-style: italic;
  font-weight: bold;
  line-height: 3rem;
  border: 2px solid black;
  transition: 0.3s all;

  &:hover {
    transform: scale(1.03);
  }

  &:active,
  &:focus {
    outline: none;
  }

  @media (max-width: 500px) {
    font-size: 4vmin;
    line-height: 10vmin;
    width: 80vmin;
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
        {snakes[activeSnake] ? (
          <React.Fragment>
            <Container>
              {Object.keys(POSITIONS).map(position => {
                return <Slitherer position={position} key={position} />;
              })}

              <Image
                src={snakes[activeSnake].url}
                alt={snakes[activeSnake].flavorText}
                title={snakes[activeSnake].flavorText}
              />
            </Container>
            <Row>
              <Button onClick={getNewSnake}>More Mother Fuckin' Snakes</Button>
            </Row>
          </React.Fragment>
        ) : (
          <Delay />
        )}
      </Wrapper>
      <audio src={Hiss} ref={audioRef} />
    </React.Fragment>
  );
}

export default App;
