import '../scss/main.scss'

function init () {

  const rootContainer = document.getElementById('root-container');

}

init();

const sunBtn = document.getElementById('sunBtn');
const moon = document.getElementById('moon');

document.querySelector(['[data-switch-dark]']).addEventListener('click',
  function() {
    document.body.classList.toggle('dark');
});
