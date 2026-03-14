const form = document.querySelector(".abc");

let colleges = [];

fetch("colleges.json")
  .then(response => response.json())
  .then(data => {
    colleges = data;
    console.log(colleges); // check if data loaded
  })
  .catch(error => console.error("Error loading JSON:", error));

   form.addEventListener("submit", function (e) {
      
e.preventDefault();

    const rank=document.getElementById("rank").value.trim();


    const category=document.getElementById("category").value;


  const state=document.getElementById("state").value;


 const genderElement=document.querySelector('input[name="gender"]:checked');



        if(!rank||Number(rank) <= 0){
            alert("Please enter a valid JEE Mains rank");
            return;
        }

        if(!category|| !state || !genderElement){

            alert("Please fill the details");
            return;
        }

        const userData = {
            rank:Number(rank),
            category:category,
            state:state,
            gender:genderElement.value
        };

    runPrediction(userData);
});

const runPrediction=(user) => {
     const results=colleges.filter(college => {

        const categoryMatch=college.category===user.category;

        const rankMatch=user.rank<=college.maxRank;

        const stateMatch =  
            college.state === "Other" ||
            college.state === user.state;

        return categoryMatch && rankMatch && stateMatch;
    });

    displayResults(results);
};







const displayResults = (results) => {
    let resultContainer = document.getElementById("results");

    if (!resultContainer) {


        resultContainer = document.createElement("div");
        resultContainer.id = "results";
     


resultContainer.style.background= "#3b827d";

resultContainer.style.borderRadius="18px";
  resultContainer.style.padding= "32px 32px 28px";
  resultContainer.style.width= "420px";
  resultContainer.style.minWidth="320px";
  resultContainer.style.fontFamily='Nunito', 'sans-serif';
  resultContainer.style.fontSize="2rem";
  resultContainer.style.boxShadow="0 24px 64px rgba(0,0,0,0.18)";



        
        document.querySelector(".card").appendChild(resultContainer);
    }

    resultContainer.innerHTML = "";

    if (results.length === 0) {
        resultContainer.innerHTML = "<p>No colleges found.</p>";
        return;
    }

    resultContainer.innerHTML=`<p>Here are the colleges you can get : </p>`

let i=1;

    results.forEach(college => {
      
        resultContainer.innerHTML += `<p>${i}. ${college.name} -> ${college.branch}
                </p>`;
    
    
    
    i++;
            });
};


