import { createContext } from "react";

import { UiStore } from "./uiStore";
import UserStore from "./userStore";

interface Store {
  uiStore: UiStore;
  userStore: UserStore;
}

export const store: Store = {
  uiStore: new UiStore(),
  userStore: new UserStore(),
};

export const StoreContext = createContext(store);
