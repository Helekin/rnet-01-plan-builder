import { NavLink } from "react-router";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { Group } from "@mui/icons-material";

import MenuItemLink from "../shared/components/MenuItemLink";

export default function NavBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          backgroundImage:
            "linear-gradient(135deg, #182A73 0%, #218AAE 69%, #20A7AE 89%)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box
              component={NavLink}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <Group fontSize="large" />
              <Typography variant="h4">Reactivities</Typography>
            </Box>

            <Box sx={{ display: "flex" }}>
              <MenuItemLink to="/activities">Activities</MenuItemLink>
              <MenuItemLink to="/create-activity">Create Activity</MenuItemLink>
            </Box>

            <Button>User Menu</Button>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}
