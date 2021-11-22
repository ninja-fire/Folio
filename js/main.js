import '../scss/main.scss'
import {createScene} from './scene';

let jobs;
let jobDetailContainer;
let jobDetails;
let mqTablet;
let mqMobile;
let mainContainer;
let btnBackDetail;

function Main() {

  mqTablet = window.matchMedia('(max-width: 960px)').matches;
  mqMobile = window.matchMedia('(max-width: 780px)').matches;

  jobs = Array.from(document.getElementsByClassName('job'));
  jobDetailContainer = document.getElementById('details');
  jobDetails = Array.from(document.getElementsByClassName('details-content'));
  mainContainer = document.getElementById('main');
  btnBackDetail = document.getElementById('backDetails');

  darkThemeToggle();
  createScene(document.getElementById('profilePicture'));
  loadMainView();
  loadJobs();
  registerJobsEvent();
  registerCloseDetailEvent();

}

function darkThemeToggle() {

  const moonBtn = document.getElementById('moonBtn');

  moonBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

}

function registerJobsEvent() {

  jobs.forEach((job, index) => job.addEventListener('click', () => {

    removeSelect();
    jobs[index].classList.add('selected');
    jobDetails[index].classList.add('selected');

    if (mqTablet) {

      mainContainer.classList.add('visible');
      btnBackDetail.style.display = 'flex';

    }

    if (jobDetailContainer.classList.contains('visible')) {
      jobDetailContainer.classList.remove('visible');
    }

  }));
}

function loadJobs() {

  if (mqMobile) {

    removeSelect();

    if (!jobDetailContainer.classList.contains('visible')) {
      jobDetailContainer.classList.add('visible');
    }

  } else if (mqTablet) {

    removeSelect();

    btnBackDetail.style.display = 'none';
    if (mainContainer.classList.contains('visible')) {
      mainContainer.classList.remove('visible');
    }
  }
}

function loadMainView() {

  let isSelected = false;
  btnBackDetail.style.display = 'none';

  for (let i = 0; i < jobs.length; i++) {
    if (jobs[i].classList.contains('selected')) {
      isSelected = true;
      break;
    }
  }

  if (mqMobile) {

    if (isSelected) {

      btnBackDetail.style.display = 'flex';

    } else {

      btnBackDetail.style.display = 'none';

      if (!jobDetailContainer.classList.contains('visible')) {
        jobDetailContainer.classList.add('visible');
      }
    }

  } else if (mqTablet) {

    if (isSelected) {

      btnBackDetail.style.display = 'flex';

      if (!mainContainer.classList.contains('visible')) {
        mainContainer.classList.add('visible');
      }

    } else {

      if (mainContainer.classList.contains('visible')) {
        mainContainer.classList.remove('visible');
      }
    }

  } else {

    if (!isSelected) {
      selectFirstJob();
    }

    if (jobDetailContainer.classList.contains('visible')) {
      jobDetailContainer.classList.remove('visible');
    }

    if (mainContainer.classList.contains('visible')) {
      mainContainer.classList.remove('visible');
    }
  }
}

function selectFirstJob() {

  jobs[0].classList.add('selected')
  jobDetails[0].classList.add('selected')

}

function removeSelect() {

  for (let i = 0; i < jobs.length; i++) {
    if (jobs[i].classList.contains('selected')) {
      jobs[i].classList.remove('selected');
    }
  }

  for (let i = 0; i < jobDetails.length; i++) {
    if (jobDetails[i].classList.contains('selected')) {
      jobDetails[i].classList.remove('selected');
    }
  }

}

function registerCloseDetailEvent() {

  btnBackDetail.addEventListener('click', () => {

    removeSelect();
    mainContainer.classList.remove('visible');
    btnBackDetail.style.display = 'none';

    if (mqMobile) {
      if (!jobDetailContainer.classList.contains('visible')) {
        jobDetailContainer.classList.add('visible');
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', Main);

window.addEventListener('resize', () => {
  mqTablet = window.matchMedia('(max-width: 960px)').matches;
  mqMobile = window.matchMedia('(max-width: 780px)').matches;
  loadMainView();
});
