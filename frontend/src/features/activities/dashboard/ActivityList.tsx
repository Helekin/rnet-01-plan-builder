import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Box, Typography } from "@mui/material";

import ActivityCard from "./ActivityCard";
import { useActivities } from "../../../lib/hooks/useActivities";

export default function ActivityList() {
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  const { activitiesGroup, isLoading, hasNextPage, fetchNextPage } =
    useActivities();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) return <Typography>Loading</Typography>;

  if (!activitiesGroup) return <Typography>No activities found</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {activitiesGroup.pages.map((activities, index) => (
        <Box
          key={index}
          ref={index === activitiesGroup.pages.length - 1 ? ref : null}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          {activities.items.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </Box>
      ))}
    </Box>
  );
}
