import { useState } from "react";
import { useParams } from "react-router";
import { Box, Button, Divider, Typography } from "@mui/material";

import { useProfile } from "../../lib/hooks/useProfile";
import ProfileEditForm from "./ProfileEditForm";

export default function ProfileAbout() {
  const { id } = useParams();
  const [editMode, setEditMode] = useState(false);

  const { profile } = useProfile(id);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5">About {profile?.displayName}</Typography>
        <Button onClick={() => setEditMode(!editMode)}>Edit profile</Button>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ overflow: "auto", maxHeight: 350 }}>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {profile?.bio || "No description added yet"}
        </Typography>
        {editMode && <ProfileEditForm setEditMode={setEditMode} />}
      </Box>
    </Box>
  );
}
