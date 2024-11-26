import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#E6F6FF",
      100: "#B3E0FF",
      200: "#80CBFF",
      300: "#4DB5FF",
      400: "#1A9FFF",
      500: "#0080FF",
      600: "#0066CC",
      700: "#004D99",
      800: "#003366",
      900: "#001A33",
    },
    accent: {
      neon: "#00FFFF",
      glow: "rgba(0, 255, 255, 0.5)",
      400: "#22D3EE",
    },
    aquamarine: {
      4: "#00f8ba", // Our brand color
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === "dark" ? "gray.900" : "white",
        color: props.colorMode === "dark" ? "white" : "gray.800",
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
      },
      variants: {
        solid: {
          bg: "aquamarine.4",
          color: "gray.900",
          _hover: {
            bg: "cyan.300",
          },
        },
        outline: {
          borderColor: "aquamarine.4",
          color: "aquamarine.4",
          _hover: {
            bg: "aquamarine.4",
            color: "gray.900",
          },
        },
      },
    },
  },
});

export default theme;

