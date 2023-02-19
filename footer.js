  //Animacao de hover para os icones das redes socias
  const icons = document.querySelectorAll('.animated-icons i');
  icons.forEach(icon => {
    icon.addEventListener('mouseover', () => {
      icon.classList.add('animate__animated', 'animate__bounce');
    });
    icon.addEventListener('animationend', () => {
      icon.classList.remove('animate__animated', 'animate__bounce');
    });
  });