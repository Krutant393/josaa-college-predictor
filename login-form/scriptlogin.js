document.addEventListener("DOMContentLoaded", function () {
  
  document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();

let password= document.getElementById("passwordx").value.trim();
    let email = document.getElementById("emailx").value.trim();

    console.log("Password:", password);
    console.log("Email:", email);

  });

});

  
//chatgpt----
  function handleGoogleLogin(response) {
  // Decode the JWT token Google returns
  const base64Url = response.credential.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

const user = JSON.parse(jsonPayload);

  console.log("Name:",    user.name);
  console.log("Email:",   user.email);
  

  // Save to localStorage and redirect
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("userName", user.name);
  localStorage.setItem("userEmail", user.email);


  window.location.href = "/index.html"; 


  

  }

