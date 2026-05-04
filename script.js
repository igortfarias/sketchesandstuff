const modal = document.querySelector("#imageModal");
const modalImage = document.querySelector("#modalImage");
const modalClose = document.querySelector("#modalClose");
const projectImages = document.querySelectorAll(".project-image");

projectImages.forEach((image) => {
image.addEventListener("click", () => {
    modalImage.src = image.src;
    modalImage.alt = image.alt;
    modal.classList.add("active");
});
});

modalClose.addEventListener("click", () => {
modal.classList.remove("active");
});

modal.addEventListener("click", (event) => {
if (event.target === modal) {
    modal.classList.remove("active");
}
});