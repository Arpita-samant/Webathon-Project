// ================================
// REGISTRATION FORM
// ================================

const registrationForm =
    document.getElementById("registrationForm");

const successMessage =
    document.getElementById("successMessage");


// ================================
// FORM SUBMIT
// ================================

registrationForm.addEventListener("submit", function (event) {

    // Stop page from refreshing
    event.preventDefault();


    // Check if form is valid
    if (!registrationForm.checkValidity()) {

        registrationForm.reportValidity();

        return;
    }


    // Get button
    const registerButton =
        document.querySelector(".register-button");


    // Change button text
    registerButton.innerHTML = `
        <span>REGISTERING...</span>
    `;


    registerButton.disabled = true;


    // Small delay for animation
    setTimeout(function () {

        // Hide form
        registrationForm.style.display = "none";


        // Show success message
        successMessage.style.display = "block";


    }, 800);

});