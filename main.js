console.log('Hi there traveler!');
const supportedSites = ['https://makerworld.com', 'https://www.thingiverse.com'];
const actions = { show: {} };

let settings = null; // Declare global settings variable

// Define the init function early
const init = async () => {
    console.log("Current settings:", settings);
    const tabs = await chrome.tabs.query({ active: true });

    // Check for the "MMP - Maker Management Platform" tab
    for (const i in tabs) {
        if (tabs[i].title === "MMP - Maker Management Platform") {
            await showInit();
            return;
        }
    }

    // Handle supported sites
    for (const i in tabs) {
        const url = new URL(tabs[i].url);
        if (supportedSites.includes(url.origin)) {
            await actions.show[url.origin]();
        }
    }
};

// Send a POST request with a payload
const send = async (payload) => {
    return await fetch(settings.local_backend + "/downloader/fetch", {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
    });
};

// Toggle the display of different screens
const toggleScreen = (id) => {
    const newScreen = document.getElementById(id);
    if (newScreen) {
        newScreen.style.display = 'block';
        document.getElementById("default-screen").style.display = 'none';
    }
};

// Initialize the settings by fetching from settings.json
const showInit = async () => {
    const initBtn = document.getElementById("init-btn");
    initBtn.onclick = async () => {
        const tabs = await chrome.tabs.query({ active: true });
        console.log("Tabs found:", tabs);

        for (const i in tabs) {
            if (tabs[i].title === "MMP - Maker Management Platform") {
                try {
                    const url = new URL(tabs[i].url);
                    const response = await fetch(url.origin + '/settings.json');
                    if (!response.ok) {
                        console.error("Failed to fetch settings.json:", response.status);
                        continue;
                    }

                    const fetchedSettings = await response.json();
                    console.log("Fetched settings:", fetchedSettings);

                    // Handle both local_backend and localBackend
                    settings = fetchedSettings.local_backend
                    ? fetchedSettings
                    : { ...fetchedSettings, local_backend: fetchedSettings.localBackend };

                    if (settings.local_backend && typeof settings.local_backend === "string") {
                        if (settings.local_backend.startsWith("/")) {
                            settings.local_backend = url.origin + settings.local_backend;
                        }
                        await chrome.storage.sync.set({ settings });
                        console.log("Settings saved to chrome storage:", settings);
                        init();
                    } else {
                        console.error("Invalid or missing local_backend in settings.json.");
                    }
                } catch (error) {
                    console.error("Error processing settings.json:", error);
                }
                break; // Exit the loop after processing the correct tab
            }
        }
    };
    toggleScreen("init-screen");
};

// Handle MakerWorld actions
actions.show['https://makerworld.com'] = async () => {
    const msgCmp = document.getElementById("mkw-msg");
    const importCMP = document.getElementById("mkw-import");

    const tabs = await chrome.tabs.query({ active: true });
    for (const i in tabs) {
        const url = new URL(tabs[i].url);
        if (url.origin === 'https://makerworld.com' && !url.pathname.includes("/models/")) {
            msgCmp.innerHTML = "This is not an importable project page.";
            importCMP.style.display = 'none';
        }
    }
    importCMP.onclick = async () => {
        const cookies = await chrome.cookies.getAll({ domain: "makerworld.com" });
        console.log(cookies);
        const tabs = await chrome.tabs.query({ active: true });
        for (const i in tabs) {
            const url = new URL(tabs[i].url);
            if (url.origin === 'https://makerworld.com') {
                const payload = { cookies, url: tabs[i].url };
                const response = await send(payload);
                if (response.code !== 200) {
                    const data = await response.json();
                    msgCmp.innerHTML = data.message;
                } else {
                    msgCmp.innerHTML = "Great Success!";
                }
            }
        }
    };
    toggleScreen("mkw-screen");
};

// Handle Thingiverse actions
actions.show['https://www.thingiverse.com'] = async () => {
    const msgCmp = document.getElementById("tv-msg");
    const importCMP = document.getElementById("tv-import");

    const tabs = await chrome.tabs.query({ active: true });
    for (const i in tabs) {
        const url = new URL(tabs[i].url);
        if (url.origin === 'https://www.thingiverse.com' && !url.pathname.includes("/thing:")) {
            msgCmp.innerHTML = "This is not an importable project page.";
            importCMP.style.display = 'none';
        }
    }
    importCMP.onclick = async () => {
        const tabs = await chrome.tabs.query({ active: true });
        for (const i in tabs) {
            const url = new URL(tabs[i].url);
            if (url.origin === 'https://www.thingiverse.com') {
                const payload = { url: tabs[i].url };
                const response = await send(payload);
                if (response.code !== 200) {
                    const data = await response.json();
                    msgCmp.innerHTML = data.message;
                } else {
                    msgCmp.innerHTML = "Great Success!";
                }
            }
        }
    };
    toggleScreen("tv-screen");
};

// Fetch the settings from chrome storage
const mmpBackendStorage = await chrome.storage.sync.get("settings");
console.log("Backend storage settings:", mmpBackendStorage);

if (mmpBackendStorage.settings) {
    settings = mmpBackendStorage.settings;
}

// Call init to start the process
await init();
