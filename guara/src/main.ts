import { createApp } from 'vue';
import { Quasar, Notify, Dialog } from 'quasar';

// ... outras importações ...

const app = createApp(App);

app.use(Quasar, {
  plugins: {
    Notify,
    Dialog
  },
  config: {
    notify: {}
  }
}); 