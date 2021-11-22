import '../scss/main.scss'
import { createScene } from './scene';

function Main(){

  const mqTablet = window.matchMedia('(max-width: 960px)').matches;

  darkThemeToggler();

  if(mqTablet) {

    detailTablet();

  } else {

    detailDesktop();

  }
  createScene(document.getElementById('profilePicture'));

}

function darkThemeToggler() {

  const moonBtn = document.getElementById('moonBtn');
  moonBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

}

function detailDesktop() {

  const detailsList = document.getElementById('detailsList');
  const jobs = Array.from(document.getElementsByClassName('job'));
  const details = Array.from(detailsList.children);

  let previousIndex = 0;
  details[previousIndex].style.display = 'flex';
  jobs[previousIndex].classList.toggle('selected');

  jobs.forEach((job, index) => job.addEventListener('click', () => {

    const detail = details[index];

    if(index === previousIndex) {

      return false;

    } else {

      details[previousIndex].style.display = 'none';
      jobs[previousIndex].classList.toggle('selected');

      detail.style.display = 'flex';
      job.classList.toggle('selected');
      previousIndex = index;

    }

  }));

}

function detailTablet() {

  const detailsList = document.getElementById('detailsList');
  const detailsContainer = document.getElementById('details');
  const mainContainer = document.getElementById('main');
  const backDetails = document.getElementById('backDetails');
  const jobs = Array.from(document.getElementsByClassName('job'));
  const details = Array.from(detailsList.children);

  let detail = null;

  jobs.forEach((job, index) => job.addEventListener('click', () => {

    detail = details[index];
    detail.style.display = 'flex';

    mainContainer.classList.toggle('visible');
    detailsContainer.style.display = 'flex';

  }));

  backDetails.addEventListener('click', () => {

    mainContainer.classList.toggle('visible');
    detailsContainer.style.display = 'none';
    detail.style.display = 'none';

  });

}

document.addEventListener('DOMContentLoaded', Main);
