import '../scss/main.scss'

function Main(){

  const moonBtn = document.getElementById('moonBtn');
  moonBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

  const detailsContainer = document.getElementById('details');
  const jobs = Array.from(document.getElementsByClassName('job'));
  const details = Array.from(detailsContainer.children);

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

document.addEventListener('DOMContentLoaded', Main);
