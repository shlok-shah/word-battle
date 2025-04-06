import { Devvit, StateSetter, useState } from "@devvit/public-api";
import { PixelText } from "./font.js";
import { getHintUsed } from "./main.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
});

const HintDisplay = (props: {
  setDisplay: StateSetter<string>;
  hint?: string;
  usedHint?: boolean;
  setUsedHint?: StateSetter<boolean>;
  _context: Devvit.Context;
  device: string;
}) => {
  const { hint, usedHint, setUsedHint, _context, setDisplay, device } = props;
  const { redis } = _context;

  const ConfirmHint = () => {
    return (
      <vstack gap="small">
        {!usedHint ? (
          <>
            <PixelText size={device === "mobile" ? 1.5 : 2}>
              Are you sure you want a hint ?
            </PixelText>
            <PixelText size={device === "mobile" ? 1.5 : 2}>
              You will recieve half the XP
            </PixelText>

            <zstack
              height="30%"
              width="30%"
              backgroundColor="green"
              alignment="middle center"
              border="thin"
              borderColor="white"
              padding="small"
              onPress={async () => {
                if (setUsedHint) setUsedHint(true);
                await redis.set(
                  getHintUsed(_context.postId, _context.userId),
                  "true"
                );
              }}
            >
              <PixelText color="white">Yes</PixelText>
            </zstack>
          </>
        ) : (
          <PixelText size={device === "mobile" ? 1.5 : 2}>{hint!}</PixelText>
        )}
      </vstack>
    );
  };

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
          <PixelText color="white">Hint</PixelText>
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
        <ConfirmHint />,
      </hstack>
    </vstack>
  );
};

export default HintDisplay;
