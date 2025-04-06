import { Devvit, StateSetter, useState } from "@devvit/public-api";
import { PixelText } from "./font.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
});

const HelpDisplay = (props: {
  setDisplay: StateSetter<string>;
  _context: Devvit.Context;
  device: string;
}) => {
  const { _context, setDisplay, device } = props;
  const { redis } = _context;

  return (
    <vstack
      height="70%"
      width={device === "mobile" ? "90%" : "60%"}
      border="thick"
      borderColor="black"
    >
      <hstack
        width="100%"
        height="20%"
        padding="small"
        backgroundColor={device === "mobile" ? "white" : "black"}
        alignment="middle"
      >
        <vstack width="90%">
          <PixelText color="white">How to play</PixelText>
        </vstack>
        <zstack
          height="100%"
          width="10%"
          backgroundColor={"red"}
          alignment="middle center"
          border="thin"
          borderColor="white"
          padding="small"
          onPress={() => setDisplay("none")}
        >
          <PixelText color="white">X</PixelText>
        </zstack>
      </hstack>
      <hstack height="80%" width="100%" backgroundColor="gray" padding="medium">
        <vstack gap="small">
          <PixelText size={1.5}>- Guess the letters of the word</PixelText>
          <PixelText size={1.5}>- Correct the letter would show up</PixelText>
          <PixelText size={1.5}>in the word</PixelText>
          <PixelText size={1.5}>- If wrong, you will lose a shield</PixelText>
          <PixelText size={1.5}>- You may use a hint</PixelText>
          <PixelText size={1.5}>- Earn XP for correct word guessed</PixelText>
        </vstack>
      </hstack>
    </vstack>
  );
};

export default HelpDisplay;
