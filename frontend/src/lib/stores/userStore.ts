import { makeAutoObservable } from "mobx";

export default class UserStore {
  token: string | null = localStorage.getItem("jwt");

  constructor() {
    makeAutoObservable(this);
  }

  setToken = (token: string | null) => {
    this.token = token;
    if (token) {
      localStorage.setItem("jwt", token);
    } else {
      localStorage.removeItem("jwt");
    }
  };

  get isLoggedIn() {
    return !!this.token;
  }
}
