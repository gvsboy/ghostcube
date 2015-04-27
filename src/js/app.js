import 'babel/polyfill';
import Game from './game';

// Create a new game on load!
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  var game = new Game('container');
});
