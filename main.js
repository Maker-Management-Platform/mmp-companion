console.log('Hi there traveler!');
const supportedSites = ['https://makerworld.com', 'https://www.thingiverse.com']
const actions = {
    show: {}
}

let settings = null;

const init = async () => {
    console.log(settings)
    const tabs = await chrome.tabs.query({ active: true })
    for (const i in tabs) {
        const url = new URL(tabs[i].url);
        if (supportedSites.includes(url.origin)) {
            await actions.show[url.origin]()
        }
    }
}

const send = async (payload) => {
    return await fetch(settings.local_backend + "/downloader/fetch", {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
    })
}

const toggleScreen = (id) => {
    const newScreen = document.getElementById(id)
    if (newScreen) {
        newScreen.style.display = 'block';
        document.getElementById("default-screen").style.display = 'none';
    }
}


const showInit = async () => {
    const initBtn = document.getElementById("init-btn")
    initBtn.onclick = async () => {
        const tabs = await chrome.tabs.query({ active: true })
        console.log(tabs)
        for (const i in tabs) {
            if (tabs[i].title === "MMP - Maker Management Platform") {
                const url = new URL(tabs[i].url);
                const response = await fetch(url.origin + '/settings.json')
                settings = await response.json();
                await chrome.storage.sync.set({ settings })
                init()
            }
        }

    };
    toggleScreen("init-screen")
}

actions.show['https://makerworld.com'] = async () => {
    document.getElementById("mkw-import").onclick = async () => {
        const cookies = await chrome.cookies.getAll({ domain: "makerworld.com" })
        console.log(cookies)
        const tabs = await chrome.tabs.query({ active: true })
        for (const i in tabs) {
            const url = new URL(tabs[i].url);
            if (url.origin === 'https://makerworld.com') {
                const payload = { cookies, url: tabs[i].url }
                const response = await send(payload)
                if (response.code !== 200) {
                    const data = await response.json()
                    document.getElementById("mkw-msg").innerHTML = data.message;
                } else {
                    document.getElementById("mkw-msg").innerHTML = "Great Success!";
                }
            }
        }


    };
    toggleScreen("mkw-screen")
}

actions.show['https://www.thingiverse.com'] = async () => {
    document.getElementById("tv-import").onclick = async () => {
        const tabs = await chrome.tabs.query({ active: true })
        for (const i in tabs) {
            const url = new URL(tabs[i].url);
            if (url.origin === 'https://www.thingiverse.com') {
                const payload = { url: tabs[i].url }
                const response = await send(payload)
                if (response.code !== 200) {
                    const data = await response.json()
                    document.getElementById("tv-msg").innerHTML = data.message;
                } else {
                    document.getElementById("tv-msg").innerHTML = "Great Success!";
                }
            }
        }


    };
    toggleScreen("tv-screen")
}


const mmpBackendStorage = await chrome.storage.sync.get("settings")
console.log(mmpBackendStorage)
if (!mmpBackendStorage.settings) {
    await showInit()
} else {
    settings = mmpBackendStorage.settings
    await init()
}