


const searchInput = document.getElementById("searchTabs");
const searchResults = document.getElementById("searchResults");

searchInput.addEventListener("input", async () => {
  const query = searchInput.value.toLowerCase().trim();
  searchResults.innerHTML = "";

  if (!query) return;

  
  const tabs = await chrome.tabs.query({});

  
  const filtered = tabs.filter(t =>
    (t.title && t.title.toLowerCase().includes(query)) ||
    (t.url && t.url.toLowerCase().includes(query))
  );

  
  if (filtered.length === 0) {
    searchResults.innerHTML = "<div>No matching tabs found.</div>";
    return;
  }

  
  filtered.forEach(tab => {
    const div = document.createElement("div");
    div.textContent = `${tab.title || tab.url}`;
    div.title = tab.url;

    
    div.addEventListener("click", async () => {
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    });

    searchResults.appendChild(div);
  });
});


document.getElementById("groupTabs").addEventListener("click", async () => {
  try {
   
    const tabs = await chrome.tabs.query({});

    
    const uniqueTabsMap = {};
    const duplicateTabIds = [];

    tabs.forEach(t => {
      if (t.url) {
        if (uniqueTabsMap[t.url]) {
          duplicateTabIds.push(t.id);
        } else {
          uniqueTabsMap[t.url] = t;
        }
      }
    });

    if (duplicateTabIds.length > 0) {
      try {
        await chrome.tabs.remove(duplicateTabIds);
      } catch (e) {
        console.warn("Some duplicates could not be closed:", e);
      }
    }

    const uniqueTabs = Object.values(uniqueTabsMap);

    
    const youtubeTabs = uniqueTabs.filter(t => t.url.includes("youtube.com"));
    const searchTabs  = uniqueTabs.filter(t => t.url.includes("google.com/search"));
    const codingTabs  = uniqueTabs.filter(t =>
      t.url.includes("github.com") ||
      t.url.includes("stackoverflow.com") ||
      t.url.includes("leetcode.com") ||
      t.url.includes("geeksforgeeks.org")
    );
    const googleDriveTabs = uniqueTabs.filter(t =>
      t.url.includes("docs.google.com") ||
      t.url.includes("drive.google.com")
    );
    const shoppingTabs = uniqueTabs.filter(t =>
      t.url.includes("amazon.") || t.url.includes("flipkart.com")
    );
    const aiTabs = uniqueTabs.filter(t =>
      t.url.includes("openai.com") ||
      t.url.includes("gemini.google.com") ||
      t.url.includes("perplexity.ai")
    );
    const streamingTabs = uniqueTabs.filter(t =>
      t.url.includes("netflix.com") ||
      t.url.includes("hotstar.com") ||
      t.url.includes("primevideo.com") ||
      t.url.includes("apple.com/apple-tv")
    );

    const otherTabs = uniqueTabs.filter(t => !(
      youtubeTabs.includes(t) ||
      searchTabs.includes(t) ||
      codingTabs.includes(t) ||
      googleDriveTabs.includes(t) ||
      shoppingTabs.includes(t) ||
      aiTabs.includes(t) ||
      streamingTabs.includes(t)
    ));

    
    const out = document.getElementById("output");
    out.innerHTML = `
      YouTube: ${youtubeTabs.length} <br>
      Search: ${searchTabs.length} <br>
      Coding: ${codingTabs.length} <br>
      Google Drive: ${googleDriveTabs.length} <br>
      Shopping: ${shoppingTabs.length} <br>
      AI: ${aiTabs.length} <br>
      Streaming: ${streamingTabs.length} <br>
      Other: ${otherTabs.length} <br>
      Duplicates closed: ${duplicateTabIds.length}
    `;

    
    const groupCategory = (tabsArray, title, color) => {
      if (tabsArray.length) {
        chrome.tabs.group({ tabIds: tabsArray.map(t => t.id) }, gid =>
          chrome.tabGroups.update(gid, { title, color })
        );
      }
    };

    groupCategory(youtubeTabs, "YouTube", "red");
    groupCategory(searchTabs, "Search", "yellow");
    groupCategory(codingTabs, "Coding", "blue");
    groupCategory(googleDriveTabs, "Docs/Drive", "purple");
    groupCategory(shoppingTabs, "Shopping", "green");
    groupCategory(aiTabs, "AI", "pink");
    groupCategory(streamingTabs, "Streaming", "orange");
    groupCategory(otherTabs, "Other", "grey");

  } catch (err) {
    console.error("Error organizing tabs:", err);
    document.getElementById("output").textContent = "Error: " + err.message;
  }
});


