import { Devvit } from "@devvit/public-api";
import { PixelText } from "./font.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
});

const Title = (props: { shieldsLeft: number; guessedLetters: string }) => {
  const { shieldsLeft, guessedLetters } = props;
  return (
    <hstack width="100%" alignment="start" padding="medium">
      <vstack width="35%" alignment="top" gap="small">
        <PixelText color="black" size={2}>
          Guess the word
        </PixelText>
        <PixelText color="black">{"Guessed-" + guessedLetters}</PixelText>
      </vstack>
      <hstack width="35%" alignment="top center" gap="small">
        {[...Array(shieldsLeft)].map((_, index) => (
          <icon key={index.toString()} name="heart-fill" color="red" />
        ))}
      </hstack>
      <hstack width="30%" alignment="end" gap="small">
        <button icon="help" />
        <button icon="contest" />
      </hstack>
    </hstack>
  );
};

export default Title;
