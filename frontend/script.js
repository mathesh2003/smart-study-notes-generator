/* =========================================
   SMART STUDY NOTES GENERATOR
========================================= */

const studyText = document.getElementById("studyText");

const wordCount = document.getElementById("wordCount");
const charCount = document.getElementById("charCount");

const exampleBtn = document.getElementById("exampleBtn");
const generateBtn = document.getElementById("generateBtn");

const summaryOutput = document.getElementById("summaryOutput");
const pointsOutput = document.getElementById("pointsOutput");

const originalWords = document.getElementById("originalWords");
const summaryWords = document.getElementById("summaryWords");
const reduction = document.getElementById("reduction");

const copySummary = document.getElementById("copySummary");


/* =========================================
   EXAMPLE STUDY MATERIAL
========================================= */

const exampleText = `
Artificial intelligence is a branch of computer science that focuses on creating machines capable of performing tasks that normally require human intelligence. These tasks include learning, reasoning, problem solving, understanding natural language, and recognizing images. AI systems use algorithms and large amounts of data to identify patterns and make decisions. Machine learning is an important part of artificial intelligence because it allows systems to learn from data without being explicitly programmed for every task. Today, artificial intelligence is used in healthcare, education, banking, transportation, cybersecurity, entertainment, and many other industries. AI can help organizations automate repetitive tasks, analyze large amounts of information, and improve decision-making. However, responsible development is important because AI systems can introduce problems such as bias, privacy concerns, and security risks.
`.trim();


/* =========================================
   WORD + CHARACTER COUNTER
========================================= */

function updateCounter() {

    const text = studyText.value.trim();

    const words = text
        ? text.split(/\s+/).length
        : 0;

    const characters = text.length;

    wordCount.textContent = `${words} words`;

    charCount.textContent = `${characters} characters`;
}


studyText.addEventListener(
    "input",
    updateCounter
);


/* =========================================
   EXAMPLE BUTTON
========================================= */

exampleBtn.addEventListener(
    "click",
    () => {

        studyText.value = exampleText;

        updateCounter();

        studyText.focus();

    }
);


/* =========================================
   GENERATE NOTES
========================================= */

generateBtn.addEventListener(
    "click",
    async () => {

        const text = studyText.value.trim();

        if (!text) {

            alert(
                "Please enter some study material first."
            );

            studyText.focus();

            return;
        }


        const numberOfWords =
            text.split(/\s+/).length;


        if (numberOfWords < 20) {

            alert(
                "Please enter at least 20 words for a meaningful summary."
            );

            studyText.focus();

            return;
        }


        /* BUTTON LOADING STATE */

        generateBtn.disabled = true;

        generateBtn.querySelector(
            "span:nth-child(2)"
        ).textContent = "Generating...";


        /* SUMMARY LOADING */

        summaryOutput.className =
            "result-content loading";

        summaryOutput.textContent = "";


        /* KEY POINT LOADING */

        pointsOutput.className =
            "result-content empty-state";

        pointsOutput.innerHTML = `
            <div class="empty-icon">✦</div>

            <p>
                AI is analyzing your study material...
            </p>
        `;


        try {

            /* =====================================
               SEND DATA TO PYTHON FLASK BACKEND
            ===================================== */

            const response = await fetch("https://smart-study-notes-api.onrender.com/api/generate", {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        text: text
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to generate study notes."
                );
            }


            /* =====================================
               DISPLAY SUMMARY
            ===================================== */

            summaryOutput.className =
                "result-content";

            summaryOutput.textContent =
                data.summary;


            /* =====================================
               DISPLAY KEY POINTS
            ===================================== */

            pointsOutput.className =
                "result-content";


            pointsOutput.innerHTML = `

                <div class="points-list">

                    ${data.key_points
                        .map(
                            (point, index) => `

                            <div class="point-item">

                                <span class="point-number">
                                    ${String(index + 1).padStart(2, "0")}
                                </span>

                                <span>
                                    ${point}
                                </span>

                            </div>
                        `
                        )
                        .join("")
                    }

                </div>
            `;


            /* =====================================
               DISPLAY TEXT STATISTICS
            ===================================== */

            originalWords.textContent =
                data.original_word_count;


            summaryWords.textContent =
                data.summary_word_count;


            reduction.textContent =
                `${data.reduction_percentage}%`;


        } catch (error) {

            console.error(
                "Generation error:",
                error
            );


            /* SUMMARY ERROR */

            summaryOutput.className =
                "result-content empty-state";

            summaryOutput.innerHTML = `

                <div class="empty-icon">!</div>

                <p>
                    ${error.message}
                </p>

            `;


            /* POINTS ERROR */

            pointsOutput.className =
                "result-content empty-state";

            pointsOutput.innerHTML = `

                <div class="empty-icon">!</div>

                <p>
                    Unable to generate key points.
                </p>

            `;


        } finally {

            generateBtn.disabled = false;

            generateBtn.querySelector(
                "span:nth-child(2)"
            ).textContent =
                "Generate Study Notes";

        }

    }
);


/* =========================================
   COPY SUMMARY
========================================= */

copySummary.addEventListener(
    "click",
    async () => {

        const text =
            summaryOutput.textContent.trim();


        if (
            !text ||
            text.includes(
                "Your AI-generated summary"
            )
        ) {

            return;
        }


        try {

            await navigator.clipboard.writeText(
                text
            );


            copySummary.textContent =
                "Copied!";


            setTimeout(
                () => {

                    copySummary.textContent =
                        "Copy";

                },
                1500
            );


        } catch (error) {

            console.error(
                "Copy failed:",
                error
            );

        }

    }
);


/* =========================================
   INITIAL COUNTER
========================================= */

updateCounter();
// --------------------------------------
// Sidebar Navigation
// --------------------------------------

const studyNotesNav = document.querySelectorAll(".nav-item")[0];
const summaryNav = document.querySelectorAll(".nav-item")[1];
const keyPointsNav = document.querySelectorAll(".nav-item")[2];

const studyMaterialSection = document.querySelector(".workspace-card");
const summarySection = document.querySelector(".summary-card");
const keyPointsSection = document.querySelector(".points-card");

function setActiveNav(activeItem) {
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    activeItem.classList.add("active");
}

studyNotesNav.addEventListener("click", () => {
    setActiveNav(studyNotesNav);

    studyMaterialSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

summaryNav.addEventListener("click", () => {
    setActiveNav(summaryNav);

    summarySection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

keyPointsNav.addEventListener("click", () => {
    setActiveNav(keyPointsNav);

    keyPointsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});
// --------------------------------------
// Automatic Sidebar Highlighting
// --------------------------------------

const sections = [
    {
        section: studyMaterialSection,
        nav: studyNotesNav
    },
    {
        section: summarySection,
        nav: summaryNav
    },
    {
        section: keyPointsSection,
        nav: keyPointsNav
    }
];

window.addEventListener("scroll", () => {

    let currentSection = sections[0];

    sections.forEach(item => {

        const sectionTop = item.section.getBoundingClientRect().top;

        if (sectionTop <= 220) {
            currentSection = item;
        }

    });

    setActiveNav(currentSection.nav);

});