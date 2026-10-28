/** @type {import('tailwindcss').Config} */
// Design tokens from the ChallengeResolver redesign.
// Screens use these names (bg-paper, text-ink, rounded-card …) instead of
// hex codes, so a color change happens here and nowhere else.
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        paper: "#F4F2EC", // screen background
        surface: "#FFFFFF", // cards, inputs
        ink: "#17181A", // main text, primary buttons
        muted: "#55585E", // secondary text
        line: "#D6D2C7", // borders, dividers, empty progress
        target: "#C2410C", // map pin, radius, location accents
        status: {
          todo: "#E6E3DA",
          "todo-ink": "#3A3D42",
          active: "#DCE6FA",
          "active-ink": "#1E3A8A",
          done: "#D6ECDD",
          "done-ink": "#1B5135",
        },
        danger: {
          DEFAULT: "#FBE4DA",
          ink: "#7A2508",
        },
      },
      // Custom fonts need one family per weight on native — `font-bold` can't
      // switch the file — so each weight gets its own class.
      fontFamily: {
        display: ["BricolageGrotesque_700Bold"], // titles
        body: ["Inter_400Regular"],
        "body-medium": ["Inter_500Medium"],
        "body-semibold": ["Inter_600SemiBold"],
        mono: ["JetBrainsMono_400Regular"], // coordinates
      },
      borderRadius: {
        input: "12px",
        button: "14px",
        card: "18px",
      },
    },
  },
  plugins: [],
};
