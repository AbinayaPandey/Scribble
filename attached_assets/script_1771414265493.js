const image = document.querySelector(".image");
const fileInput = document.querySelector(".file-input");
const addBtn = document.querySelector(".add-btn");
let cropper;

// Trigger file input
addBtn.addEventListener("click", () => fileInput.click());

// Handle image upload
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      image.src = event.target.result;
      if (cropper) cropper.destroy(); // Reset previous cropper
      cropper = new Cropper(image, { 
        background: false, // Remove the checkerboard pattern
        aspectRatio: NaN 
      });
    };
    reader.readAsDataURL(file);
  }
});

// Crop logic
document.querySelector(".crop-btn").addEventListener("click", function () {
  if (cropper) {
    var croppedImage = cropper.getCroppedCanvas().toDataURL("image/png");
    document.querySelector(".output").src = croppedImage;
    document.querySelector(".cropped-container").style.display = "flex";
  }
});

