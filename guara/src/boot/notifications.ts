import { boot } from 'quasar/wrappers';
import { Notify, Dialog } from 'quasar';

export default boot(() => {
  // Configure Notify defaults
  Notify.setDefaults({
    position: 'top',
    timeout: 2500,
    textColor: 'white'
  });
}); 