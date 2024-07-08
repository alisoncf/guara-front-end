import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      name: '',
      email: '',
      permission: ''
    },
    isLoggedIn: false
  }),
  actions: {
    login(userData: any) {
      this.user = userData;
      this.isLoggedIn = true;
    },
    logout() {
      this.user = {
        name: '',
        email: '',
        permission: ''
      };
      this.isLoggedIn = false;
    }
  }
});
