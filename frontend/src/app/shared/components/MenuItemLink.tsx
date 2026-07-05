import { type ReactNode } from "react";
import { NavLink } from "react-router";
import { Button } from "@mui/material";

export default function MenuItemLink({
  children,
  to,
}: {
  children: ReactNode;
  to: string;
}) {
  return (
    <Button
      component={NavLink}
      to={to}
      sx={{
        color: "inherit",
        fontSize: "1.2rem",
        textTransform: "uppercase",
        fontWeight: "bold",
        "&.active": { color: "yellow" },
      }}
    >
      {children}
    </Button>
  );
}
