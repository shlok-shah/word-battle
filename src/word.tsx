import { Devvit } from "@devvit/public-api";
import { PixelText } from "./font.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
});

const Word = (props: {
  context: Devvit.Context;
  guessedLetters: string;
  word: string;
}) => {
  const { context, guessedLetters, word } = props;
  const guess = word
    .split("")
    .reduce(
      (acc, letter) => acc + (guessedLetters.includes(letter) ? letter : "_"),
      ""
    );

  return (
    <hstack width="100%" alignment="center middle" gap="small">
      {Array.from(guess).map((char, i) => (
        <vstack key={i.toString()}>
          <PixelText size={4}>{char}</PixelText>
        </vstack>
      ))}
    </hstack>
  );
};

export default Word;
