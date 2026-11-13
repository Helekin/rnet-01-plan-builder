import { createContext } from "react";

import { UiStore } from "./uiStore";
import UserStore from "./userStore";
import { ActivityStore } from "./activityStore";

interface Store {
  uiStore: UiStore;
  userStore: UserStore;
  activityStore: ActivityStore;
}

export const store: Store = {
  uiStore: new UiStore(),
  userStore: new UserStore(),
  activityStore: new ActivityStore(),
};

export const StoreContext = createContext(store);
