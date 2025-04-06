import { Devvit, StateSetter, useState } from "@devvit/public-api";
import { PixelText } from "./font.js";
import { getGuessedLetters } from "./main.js";
import { updateIndex } from "isomorphic-git";
import { totalShields } from "./main.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
});

const alphabets = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];
const Keyboard = (props: {
  guessedLetters: string;
  setGuessedLetters: StateSetter<string>;
  setShieldsLeft: StateSetter<number>;
  setCurrentScreen: StateSetter<string>;
  _context: Devvit.Context;
  word: string;
  device: string;
  isGameOver: (updatedLetters?: string, updatedShieldsLeft?: number) => boolean;
}) => {
  const {
    guessedLetters,
    setGuessedLetters,
    setCurrentScreen,
    setShieldsLeft,
    _context,
    word,
    isGameOver,
    device,
  } = props;
  const { redis } = _context;

  const keyPressed = async (alphabet: string) => {
    const oldGuessedLetters = guessedLetters;
    if (guessedLetters.includes(alphabet)) {
      return console.log("already been selected");
    } else {
      setGuessedLetters((guessedLetters) => guessedLetters + alphabet);
      const updatedLetters = oldGuessedLetters + alphabet;
      const wrongGuesses = updatedLetters
        .split("")
        .reduce(
          (shields, letter) => (word.includes(letter) ? shields : shields + 1),
          0
        );
      setShieldsLeft(Math.max(0, totalShields - wrongGuesses));
      const updatedShieldsLeft = Math.max(0, totalShields - wrongGuesses);
      isGameOver(updatedLetters, updatedShieldsLeft);
      redis.set(
        getGuessedLetters(_context.postId, _context.userId),
        updatedLetters
      );
    }
  };

  return (
    <vstack>
      {alphabets.map((alphabetRow, index) => {
        return (
          <hstack width="100%" alignment="center">
            {alphabetRow.map((alphabet, index) => {
              return (
                <zstack
                  key={alphabet}
                  height={device === "laptop" ? "35px" : "30px"}
                  width={device === "laptop" ? "35px" : "30px"}
                  backgroundColor={
                    guessedLetters.includes(alphabet)
                      ? "#FFFFFF0F"
                      : device === "mobile"
                      ? "white"
                      : "black"
                  }
                  alignment="center middle"
                  border="thin"
                  borderColor={device === "mobile" ? "black" : "white"}
                  onPress={(event) => {
                    keyPressed(alphabet);
                  }}
                >
                  <PixelText color="white">{alphabet}</PixelText>
                </zstack>
              );
            })}
          </hstack>
        );
      })}
    </vstack>
  );
};

export default Keyboard;
