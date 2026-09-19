import { useState, useId } from "react";

import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import { useAccount } from "../../lib/hooks/useAccount";
import { Link } from "react-router";
import { Add, Logout } from "@mui/icons-material";

export default function UserMenu() {
  const id = useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { currentUser, logoutUser } = useAccount();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id={buttonId}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        color="inherit"
        size="large"
        sx={{ fontSize: "1.1rem" }}
        onClick={handleClick}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar />
          {currentUser?.displayName}
        </Box>
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": buttonId,
          },
        }}
      >
        <MenuItem component={Link} to="/createActivity" onClick={handleClose}>
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText>Create Activity</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to="/profile" onClick={handleClose}>
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText>My profile</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            logoutUser.mutate();
            handleClose();
          }}
        >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
}
