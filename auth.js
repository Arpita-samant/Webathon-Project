
const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwhz3NNDqUpBy_Ld5OEP2c9cnSY7MSRlryWVhNHvPgPphLjNUZkHdRRrMAZ9wa7V9AA-A/exec";


// ==========================
// SIGNUP
// ==========================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const name =
            document.getElementById("signupName").value.trim();

        const email =
            document.getElementById("signupEmail").value.trim();

        const password =
            document.getElementById("signupPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message =
            document.getElementById("signupMessage");


        // Check passwords
        if (password !== confirmPassword) {

            message.textContent = "Passwords do not match.";

            return;
        }


        message.textContent = "Creating account...";


        try {

            const response = await fetch(SCRIPT_URL, {

                method: "POST",

                body: JSON.stringify({

                    action: "signup",

                    name: name,

                    email: email,

                    password: password

                })

            });


            const result = await response.json();


            if (result.success) {

                message.textContent =
                    "Account created successfully!";

                signupForm.reset();


                // Go to login after 1 second
                setTimeout(() => {

                    window.location.href = "login.html";

                }, 1000);

            } else {

                message.textContent =
                    result.message;

            }

        } catch (error) {

            console.error(error);

            message.textContent =
                "Something went wrong. Please try again.";

        }

    });

}



// ==========================
// LOGIN
// ==========================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();


        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;


        const message =
            document.getElementById("loginMessage");


        message.textContent = "Logging in...";


        try {

            const response = await fetch(SCRIPT_URL, {

                method: "POST",

                body: JSON.stringify({

                    action: "login",

                    email: email,

                    password: password

                })

            });


            const result = await response.json();


            if (result.success) {

                message.textContent =
                    "Login successful!";


                // Store login information
                localStorage.setItem(
                    "loggedIn",
                    "true"
                );

                localStorage.setItem(
                    "userName",
                    result.name
                );

                localStorage.setItem(
                    "userId",
                    result.id
                );


                // Go to home page
                setTimeout(() => {

                    window.location.href = "index.html";

                }, 800);

            } else {

                message.textContent =
                    result.message;

            }

        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to server.";

        }

    });

}