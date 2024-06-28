const { chromium } = require("playwright");

// Function to launch browser and validate Hacker News articles
async function saveHackerNewsArticles() {
  // Launch browser
  const browser = await chromium.launch({ headless: true }); // headless true for faster execution
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to Hacker News 'newest' page
    await page.goto("https://news.ycombinator.com/newest");
    console.log("Navigated to Hacker News 'newest' page.");

    // Wait for articles to load with increased timeout
    await page.waitForSelector(".athing");
    console.log("Articles loaded successfully.");

    // Fetch the first 100 articles
    const articles = await page.$$eval(".athing", (articles) => {
      return articles.slice(0, 100).map((article) => {
        const title = article.querySelector(".title a").innerText;
        const ageText =
          article.nextElementSibling.querySelector(".age").innerText;
        return { title, ageText };
      });
    });
    console.log(`Fetched ${articles.length} articles.`);

    // Function to parse age text into minutes
    const parseAgeToMinutes = (ageText) => {
      const [value, unit] = ageText.split(" ");
      const multiplier = unit.startsWith("minute")
        ? 1
        : unit.startsWith("hour")
        ? 60
        : unit.startsWith("day")
        ? 1440
        : 0;
      return parseInt(value) * multiplier;
    };

    // Validate if articles are sorted from newest to oldest
    let isSorted = true;
    for (let i = 0; i < articles.length - 1; i++) {
      const currentArticleMinutes = parseAgeToMinutes(articles[i].ageText);
      const nextArticleMinutes = parseAgeToMinutes(articles[i + 1].ageText);
      if (currentArticleMinutes > nextArticleMinutes) {
        isSorted = false;
        console.log(`Articles are not sorted at index ${i}.`);
        break;
      }
    }

    console.log(
      isSorted
        ? "Articles are sorted correctly."
        : "Articles are not sorted correctly."
    );
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Close the browser
    await browser.close();
    console.log("Browser closed.");
  }
}

// Main function to execute the script
(async () => {
  await saveHackerNewsArticles();
})();
