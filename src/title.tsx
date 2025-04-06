import { Devvit } from "@devvit/public-api";
import { PixelText } from "./font.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
});

const Title = (props: {
  shieldsLeft: number;
  guessedLetters: string;
  device: string;
}) => {
  const { shieldsLeft, guessedLetters, device } = props;
  return (
    <hstack width="100%" alignment="start" padding="medium">
      <vstack width="30%" alignment="top" gap="small">
        <PixelText color="white" size={2}>
          Guess the word
        </PixelText>
      </vstack>

      <hstack width="30%" alignment="end" gap="small">
        <zstack
          backgroundColor={device === "mobile" ? "white" : "black"}
          padding="medium"
          border="thick"
          borderColor="white"
          alignment="center middle"
        >
          <PixelText color="white" size={2}>
            Info
          </PixelText>
        </zstack>
        <zstack
          backgroundColor="gray"
          border="thin"
          borderColor="white"
          alignment="center middle"
          padding="small"
        >
          <image
            url="hint.png"
            imageWidth="20px"
            imageHeight="30px"
            resizeMode="cover"
          ></image>
        </zstack>
      </hstack>
    </hstack>
  );
};

export default Title;
