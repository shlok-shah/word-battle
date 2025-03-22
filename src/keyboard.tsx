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
  isGameOver: (updatedLetters: string, updatedShieldsLeft: number) => boolean;
}) => {
  const {
    guessedLetters,
    setGuessedLetters,
    setCurrentScreen,
    setShieldsLeft,
    _context,
    word,
    isGameOver,
  } = props;
  const { redis } = _context;

  const keyPressed = (alphabet: string) => {
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
      redis.set(
        getGuessedLetters(_context.postId, _context.userId),
        updatedLetters
      );
      isGameOver(updatedLetters, updatedShieldsLeft);
    }
  };

  return (
    <vstack height="50%" width="70%">
      {alphabets.map((alphabetRow, index) => {
        return (
          <hstack width="100%" alignment="center">
            {alphabetRow.map((alphabet, index) => {
              return (
                <zstack
                  key={alphabet}
                  height="35px"
                  width="35px"
                  backgroundColor="black"
                  alignment="center middle"
                  border="thin"
                  borderColor="white"
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
