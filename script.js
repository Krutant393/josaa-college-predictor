const form = document.querySelector(".abc");
let colleges = [];

fetch("colleges.json")
    .then(res => res.json())
    .then(data => {
        colleges = data;
      //colleges.json ka array
      // 
        console.log(`Loaded ${colleges.length} colleges`);
    })
  //error  catch keyowrd
  .catch(() => console.warn("no data found in colleges.json rerun web scrapping by puppteer first(server.js)"));

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const rank     = document.getElementById("rank").value.trim();

    const category = document.getElementById("category").value;

const jeeadvrank= document.getElementById("jee-adv-rank").value.trim();

console.log(jeeadvrank);




    const genderElement = document.querySelector('input[name="gender"]:checked');
    const quotaElement  = document.querySelector('input[name="quota"]:checked');

    if (!rank  || Number(rank) <= 0) {
        alert("Please enter a valid JEE Mains or JEE Adv rank");

        return;
    }


    if (!category ||!genderElement) {
        alert("Please fill all details");
        return;
    }

    runPrediction({
        rank:    Number(rank),
        category: category,
        state:    state,
        gender:   genderElement.value,
        quota:    quotaElement ? quotaElement.value : "ALL"
    });
});
//match prediction systemm-->
const runPrediction = (user) => {
    const results = colleges.filter(college => {

 const categoryMatch = college.seatType === user.category;

        const rankMatch = user.rank <= (parseInt(college.closingRank) || 999999);

        const genderMatch =
            college.gender === "Gender-Neutral" ||
            (user.gender === "female" &&
             college.gender.toLowerCase().includes("female"));

        const quotaMatch =
            user.quota === "ALL" ||
            college.quota === user.quota;

        return categoryMatch && rankMatch && genderMatch && quotaMatch;
    });

    displayResults(results);
};

const seatTagStyle = (type) => {
    const map = {
        "OPEN":    "background:#e6f7f5;color:#0f6e56;border:1px solid #9fe1cb;",
        "OBC-NCL": "background:#fff3e0;color:#7c4700;border:1px solid #ffcc80;",
        "SC":      "background:#fce4ec;color:#880e4f;border:1px solid #f48fb1;",
        "ST":      "background:#ede7f6;color:#4527a0;border:1px solid #ce93d8;",
"EWS":     "background:#e3f2fd;color:#1565c0;border:1px solid #90caf9;",
  "PwD":     "background:#fdf2f8;color:#701a75;border:1px solid #f0abfc;",
    };
    return map[type] || "background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;";
};

const displayResults = (results) => {
//remove olderr rsults
    const old = document.getElementById("results");
 if (old) old.remove();

    const container = document.createElement("div");
    container.id = "results";
    container.style.cssText = `
        font-family: 'Nunito', sans-serif;
        width: 100%;
        margin: 28px 0 0;
        padding: 0 0 40px;
    `;

   
    document.querySelector(".abc").insertAdjacentElement("afterend", container);

    
    if (!results || results.length === 0) {
        container.innerHTML = `
            <div style="
                                       background:#f8fafb;
                border-radius:16px;
                border:1.5px dashed #cbd5e1;
                margin-top:8px;
            ">
                <p style="font-size:1.8rem;margin-bottom:10px;">&#128269;</p>
                <p style="font-size:0.95rem;font-weight:800;color:#1a202c;margin:0 0 6px;">
                    No colleges found
                </p>
                <p style="font-size:0.82rem;color:#94a3b8;margin:0;">
                    Try adjusting your rank, category or quota
                </p>
            </div>`;
        return;
    }

    //css gpt
    container.innerHTML = `
        <div style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            margin-bottom:18px;
            padding:16px 0 14px;
            border-top:1.5px solid #e8f5f3;
            border-bottom:2px solid #3b827d;
        ">
            <h3 style="
                font-size:1rem;
                font-weight:800;
                color:#1a202c;
                margin:0;
            ">Colleges you can get</h3>
            <span style="
                font-size:0.78rem;
                background:#e6f7f5;
                color:#3b827d;
                padding:4px 14px;
                border-radius:20px;
                font-weight:700;
            ">${results.length} results</span>
        </div>
    `;


   
    results.forEach((college, i) => {

        const card = document.createElement("div");
        card.style.cssText = `
            background:#ffffff;
            border-radius:16px;
            padding:18px 18px 16px 22px;
            margin-bottom:14px;
            box-shadow:0 2px 16px rgba(59,130,125,0.08);
            border:1.5px solid #edf2f7;
            position:relative;
            overflow:hidden;
            transition:box-shadow 0.2s ease, transform 0.2s ease;
            cursor:default;
        `;

        const bar = document.createElement("div");
        bar.style.cssText = `
            position:absolute;
            left:0; top:0; bottom:0;
            width:5px;
            background:#3b827d;
            border-radius:4px 0 0 4px;
        `;
        card.appendChild(bar);

        card.onmouseenter = () => {
            card.style.transform = "translateY(-2px)";
            card.style.boxShadow = "0 8px 32px rgba(59,130,125,0.18)";
        };




        card.onmouseleave = () => {
            card.style.transform = "translateY(0)";
            card.style.boxShadow = "0 2px 16px rgba(73, 166, 160, 0.08)";
        };

        card.innerHTML += `
            <div style="
                display:flex;
                align-items:flex-start;
                justify-content:space-between;
                gap:12px;
                margin-bottom:8px;
            ">
                <div style="flex:1;">
                    <div style="
                        font-size:0.7rem;
                        font-weight:700;
                        color:#3b827d;
                        margin-bottom:3px;
                    ">#${i + 1}</div>
                    <div style="
                        font-size:0.88rem;
                        font-weight:800;
                        color:#1a202c;
                        line-height:1.4;
                    ">${college.name}</div>
                </div>
                <div style="
                    display:flex;
                    flex-direction:column;
                    align-items:flex-end;
                    flex-shrink:0;
                ">
                    <span style="
                        font-size:0.6rem;
                        color:#94a3b8;
                        font-weight:700;
                        letter-spacing:0.6px;
                        text-transform:uppercase;
                    ">Closing Rank</span>
                    <span style="
                        font-size:1.25rem;
                        font-weight:900;
                        color:#3b827d;
                        line-height:1.2;
                    ">${Number(college.closingRank).toLocaleString("en-IN")}</span>
                </div>
            </div>

            <div style="
                font-size:0.8rem;
                color:#4a5568;
                font-weight:600;
                margin-bottom:13px;
                line-height:1.5;
                padding-right:8px;
            ">${college.branch}</div>

            <div style="display:flex;gap:7px;flex-wrap:wrap;align-items:center;">

                <span style="
                    font-size:0.68rem;
                    font-weight:700;
                    padding:4px 10px;
                    border-radius:20px;
                    ${seatTagStyle(college.seatType)}
                ">${college.seatType || "OPEN"}</span>

                <span style="
                    font-size:0.68rem;
                    font-weight:700;
                    padding:4px 10px;
                    border-radius:20px;
                    background:#f0fdf4;
                    color:#166534;
                    border:1px solid #bbf7d0;
                ">Quota: ${college.quota || "—"}</span>

                <span style="
                    font-size:0.68rem;
                    font-weight:700;
                    padding:4px 10px;
                    border-radius:20px;
                    background:#f5f3ff;
                    color:#5b21b6;
                    border:1px solid #ddd6fe;
                ">Round ${college.round || "6"}</span>

                <span style="
                    margin-left:auto;
                    font-size:0.68rem;
                    color:#94a3b8;
                    font-weight:600;
                ">Opening: <strong style="color:#64748b;">
                    ${Number(college.openingRank).toLocaleString("en-IN")}
                </strong></span>



            </div>
        `;

 container.appendChild(card);//child card append to main karo
 
    });
};

