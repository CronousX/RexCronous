// Preload

var clock = document.querySelector(".clock");

document.addEventListener('DOMContentLoaded', () => {
  "use strict";
  const preloader = document.querySelector('#preloader');
  var logo = document.querySelector(".logo");

  if (preloader) {
  window.addEventListener('load', () => {
    setTimeout(function() {
      logo.style.animationName = "PreloadEnd";
      logo.classList.add("loaded");
      logo.nextElementSibling.style.opacity = "1";
      window.scrollTo(0, 0);

      preloader.addEventListener('click', () =>{
        preloader.style.backgroundColor = "unset";
        
        tsParticles.loadJSON("tsparticles", "assets/config/particlesEnd.json").then(container => {})
        tsParticles.loadJSON("tsparticles2", "assets/config/particlesHead.json").then(container => {});
        preloader.style.pointerEvent = "none";

        preloader.style.background_color = "unset";
        setTimeout(function() {
          preloader.style.scale = "1.5";
          preloader.style.opacity = "0";
          setTimeout(function() {
            preloader.style.display = "none";
            clock.style.opacity = "1";
            vm.play();
          }, 1000);
        }, 1000);
      })
    }, 2000);
  });
  }
});

//Particles

tsParticles.loadJSON("tsparticles", "assets/config/particles.json").then(container => {
})

// Clock

const secondHand = document.querySelector('.second-hand');
const minsHand = document.querySelector('.min-hand');
const hourHand = document.querySelector('.hour-hand');

 function setDate() {
  const now = new Date();

  const seconds = now.getSeconds();
  const secondsDegrees = ((seconds / 60) * 360) + 90;
  secondHand.style.transform = `rotate(${secondsDegrees}deg)`;

  const mins = now.getMinutes();
  const minsDegrees = ((mins / 60) * 360) + ((seconds/60)*6) + 90;
  minsHand.style.transform = `rotate(${minsDegrees}deg)`;

  const hour = now.getHours();
  const hourDegrees = ((hour / 12) * 360) + ((mins/60)*30) + 90;
  hourHand.style.transform = `rotate(${hourDegrees}deg)`;
}

setInterval(setDate, 1000);

setDate();

// Music Player

var musicPlayer = document.querySelector(".music-player");
var musicPBut = document.querySelector(".music-player-button");

function open() {
  musicPlayer.classList.toggle("openned");
}

musicPBut.addEventListener('click', () => {
  open();
})

// Random #1

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

document.querySelector("#logo").onmouseover = event => {
  let iterations = 0;

  const interval = setInterval(() => {
    event.target.innerText = event.target.innerText.split("")
    .map((letter, index) => {
      if (index < iterations) {
        return event.target.dataset.value[index];
      }

      return letters[Math.floor(Math.random() * 26)]
    })
    .join("");

    if (iterations >= event.target.dataset.value.length) clearInterval(interval);

    iterations += 1 / 3;
  }, 50);
}