import { createTheme } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,

      primary: {
        main: mode === "light" ? "#000000" : "#ffffff",
        contrastText: mode === "light" ? "#ffffff" : "#000000",
      },

      background: {
        default: mode === "light" ? "#ffffff" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
      },

      text: {
        primary: mode === "light" ? "#000000" : "#ffffff",
        secondary: mode === "light" ? "#555555" : "#bbbbbb", 
      },

      divider: mode === "light" ? "#e0e0e0" : "#2a2a2a", 
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === "light" ? "#ffffff" : "#121212",
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            textTransform: "uppercase",
            borderRadius: 6,
          },

          contained: {
            backgroundColor: mode === "light" ? "#000000" : "#ffffff",
            color: mode === "light" ? "#ffffff" : "#000000",

            "&:hover": {
              backgroundColor: mode === "light" ? "#000000" : "#ffffff",
            },

            "&.Mui-disabled": {
              backgroundColor: "#dcdcdc",
              color: "#9e9e9e",
            },
          },

          outlined: {
            borderColor: mode === "light" ? "#000000" : "#ffffff",
            color: mode === "light" ? "#000000" : "#ffffff",

            "&:hover": {
              borderColor: mode === "light" ? "#000000" : "#ffffff",
              backgroundColor: "transparent",
            },
          },
        },
      },
    },
  });