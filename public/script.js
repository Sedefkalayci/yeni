document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('gameframe');
    if (iframe) {
        iframe.style.pointerEvents = "none";
    }
});