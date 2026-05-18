import { useEffect, useState } from "react";
import axios from "axios";
import { List, ListItem, ListItemText, Typography } from "@mui/material";

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    axios
      .get<Activity[]>("http://localhost:5001/api/activities")
      .then((response) => setActivities(response.data));
  }, []);
  return (
    <>
      <Typography variant="h3">Activities</Typography>
      <List>
        {activities.map((activity) => (
          <ListItem>
            <ListItemText key={activity.id}>{activity.title}</ListItemText>
          </ListItem>
        ))}
      </List>
    </>
  );
}

export default App;
