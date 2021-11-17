import '../scss/main.scss'

function init () {

  const rootContainer = document.getElementById('root-container');

}

init();

document.querySelector(['[data-switch-dark]']).addEventListener('click',
  function() {
    document.body.classList.toggle('dark');
});
