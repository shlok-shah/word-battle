import { Devvit, FormKey, StateSetter, useForm } from "@devvit/public-api";
import { PixelText } from "../font.js";

Devvit.configure({
  redditAPI: true,
});

const GameOverMenu = (props: {
  setCurrentScreen: StateSetter<string>;
  context: Devvit.Context;
  shieldsLeft: number;
  result: string;
  device: string;
}) => {
  const { setCurrentScreen, context, shieldsLeft, result, device } = props;

  const postCommentForm = useForm(
    {
      fields: [
        {
          lineHeight: 3,
          type: "paragraph",
          name: "text",
          label: "Tell the world",
          required: true,
          defaultValue:
            result === "win"
              ? `I guessed the word with ${shieldsLeft} shield${
                  shieldsLeft === 1 ? "" : "s"
                } left, can you beat me ?`
              : "I was almost there, can you find the word ?",
          acceptLabel: "Add Comment",
        },
      ],
    },
    async (values) => {
      const { ui, reddit } = context;
      ui.showToast(
        "Posting your comment, you'll be redirected to the comment soon!"
      );
      const comment = await reddit.submitComment({
        id: context.postId!,
        text: values.text,
      });
      ui.navigateTo(comment);
    }
  );

  return (
    <vstack gap="small">
      <zstack
        onPress={() => setCurrentScreen("leaderboard")}
        backgroundColor={device === "mobile" ? "white" : "black"}
        padding="small"
        border="thick"
        borderColor="white"
        alignment="center middle"
      >
        <PixelText color="white" size={2}>
          Leaderboard
        </PixelText>
      </zstack>
      <zstack
        onPress={() => setCurrentScreen("level")}
        backgroundColor={device === "mobile" ? "white" : "black"}
        padding="small"
        border="thick"
        borderColor="white"
        alignment="center middle"
      >
        <PixelText color="white" size={2}>
          Levels
        </PixelText>
      </zstack>
      <zstack
        onPress={() => context.ui.showForm(postCommentForm)}
        backgroundColor={device === "mobile" ? "white" : "black"}
        padding="small"
        border="thick"
        borderColor="white"
        alignment="center middle"
      >
        <PixelText color="white" size={2}>
          Add Comment
        </PixelText>
      </zstack>
    </vstack>
  );
};

export default GameOverMenu;
