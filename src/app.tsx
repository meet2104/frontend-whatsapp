import { useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppRoutes from "./routes/approutes";
import { getTheme } from "./theme/theme";

/* ================= THEME HELPERS ================= */

const getInitialTheme = (): "light" | "dark" => {
  const savedTheme = localStorage.getItem("theme");
  return savedTheme === "dark" ? "dark" : "light";
};

function App() {
  const [mode, setMode] = useState<"light" | "dark">(getInitialTheme);

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next); 
      return next;
    });
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes toggleTheme={toggleTheme} mode={mode} />
    </ThemeProvider>
  );
}

export default App;
