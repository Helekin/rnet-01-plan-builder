import { NavLink } from "react-router";
import { Observer } from "mobx-react-lite";
import {
  AppBar,
  Box,
  Container,
  LinearProgress,
  Toolbar,
  Typography,
} from "@mui/material";
import { Group } from "@mui/icons-material";

import MenuItemLink from "../shared/components/MenuItemLink";
import { useStore } from "../../lib/hooks/useStore";
import { useAccount } from "../../lib/hooks/useAccount";

export default function NavBar() {
  const { uiStore } = useStore();
  const { currentUser } = useAccount();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          backgroundImage:
            "linear-gradient(135deg, #182A73 0%, #218AAE 69%, #20A7AE 89%)",
          position: "relative",
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

            <Box sx={{ display: "flex", alignItems: "center" }}>
              {currentUser ? (
                <Typography>Welcome {currentUser.displayName}</Typography>
              ) : (
                <>
                  <MenuItemLink to="/login">Login</MenuItemLink>
                  <MenuItemLink to="/register">Register</MenuItemLink>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
        <Observer>
          {() =>
            uiStore.isLoading ? (
              <LinearProgress
                color="secondary"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                }}
              />
            ) : null
          }
        </Observer>
      </AppBar>
    </Box>
  );
}
