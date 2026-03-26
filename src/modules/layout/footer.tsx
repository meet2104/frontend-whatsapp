import { Box, Typography, useTheme } from "@mui/material";

const FOOTER_HEIGHT = 64;

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        minHeight: FOOTER_HEIGHT,
        px: { xs: 2, sm: 3 },
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        zIndex: 1200,
      }}
    >
      {/* LEFT */}
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          flex: "1 1 280px",
          textAlign: { xs: "center", md: "left" },
        }}
      >
        Powered By NEURONET SYSTEMS PVT LTD
      </Typography>

      {/* RIGHT */}
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          flex: "1 1 280px",
          textAlign: { xs: "center", md: "right" },
        }}
      >
        All Rights Reserved By NEURONET SYSTEMS PVT LTD &copy; {currentYear}
      </Typography>
    </Box>
  );
};

export default Footer;
