function render() {
    // Initialization
    const tabsAll = document.getElementById("tabs-all");
    while (tabsAll.firstChild) tabsAll.removeChild(tabsAll.firstChild);

    chrome.tabs.query({}, async function (tabs) {
        document.getElementById("tab-count").innerText = tabs.length;

        // Get active window
        let activeWindowId;
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].active) {
                let windowId = tabs[i].windowId;
                let a = await chrome.windows.get(windowId);
                if (a.focused) {
                    activeWindowId = windowId;
                    break;
                }
            }
        }

        // Sort tabs by url
        tabs.sort(function (a, b) {
            if (a.url < b.url) return -1;
            if (a.url > b.url) return 1;
            return 0;
        });
        // tabs.forEach(function (tab) {
        for (let i = 0; i < tabs.length; i++) {
            let tab = tabs[i];
            const tabDiv = tabsAll.appendChild(document.createElement("div"));
            tabDiv.className = "tab-wrap";

            if (tab.windowId === activeWindowId) {
                if (tab.active) {
                    tabDiv.classList.add("current");
                } else {
                    tabDiv.classList.add("active");
                }
            } else {
                tabDiv.classList.add("inactive");
            }
            tabDiv.id = tab.id;
            tabDiv.setAttribute("data-title-normalized", tab.title.normalize("NFKC").toLowerCase().replaceAll(" ", ""));
            tabDiv.setAttribute("data-index", i);

            // Tab title block
            const tabTitleBlock = tabDiv.appendChild(document.createElement("div"));
            tabTitleBlock.className = "tab-title-block";
            const tabTitle = tabTitleBlock.appendChild(document.createElement("div"));
            tabTitle.innerText = tab.title;
            tabTitle.className = "tab-title";

            // Tab detail panel
            const tabDetail = tabDiv.appendChild(document.createElement("div"));
            tabDetail.className = "tab-detail";
            tabDetail.style.display = "none";
            const tabUrl = tabDetail.appendChild(document.createElement("div"));
            tabUrl.className = "tab-url";
            const tabUrlTitle = tabUrl.appendChild(document.createElement("span"));
            tabUrlTitle.innerText = "URL: ";
            tabUrlTitle.className = "tab-detail-title-block";
            const tabUrlText = tabUrl.appendChild(document.createElement("span"));
            tabUrlText.innerText = tab.url;
            tabUrlText.className = "tab-url-text";

            // Tab control panel
            const tabControl = tabDetail.appendChild(document.createElement("div"));
            tabControl.className = "tab-control";
            const tabFocusBtn = tabControl.appendChild(document.createElement("button"));
            tabFocusBtn.className = "tab-btn";
            tabFocusBtn.innerText = "Focus";
            tabFocusBtn.addEventListener("click", () => {
                chrome.tabs.update(tab.id, { active: true });
            });
            const tabCloseBtn = tabControl.appendChild(document.createElement("button"));
            tabCloseBtn.className = "tab-btn";
            tabCloseBtn.innerText = "Close";
            tabCloseBtn.addEventListener("click", () => {
                chrome.tabs.remove(tab.id);
            });

            // Tab deatil panel display control
            const tabCtrlDisp = tabDiv.appendChild(document.createElement("div"));
            tabCtrlDisp.className = "tab-ctrl-disp";
            tabCtrlDisp.setAttribute(`data-${tab.id}-disp`, "false");
            tabDiv.addEventListener("click", () => {
                if (tabCtrlDisp.getAttribute(`data-${tab.id}-disp`) === "false") {
                    tabCtrlDisp.setAttribute(`data-${tab.id}-disp`, "true");
                    tabDetail.style.display = "block";
                } else {
                    tabCtrlDisp.setAttribute(`data-${tab.id}-disp`, "false");
                    tabDetail.style.display = "none";
                }
                tabTitle.classList.toggle("tab-title");
                tabTitle.classList.toggle("tab-title-show");
            });
        }
        search();
    });
}

function search() {
    const searchWord = document.getElementById("search-text").value.normalize("NFKC").toLowerCase().replaceAll(" ", "");
    const tabWraps = document.getElementsByClassName("tab-wrap");
    if (searchWord === "") {
        for (let i = 0; i < tabWraps.length; i++) {
            const tabWrap = tabWraps[i];
            tabWrap.style.display = "block";
        }
        return;
    }
    for (let i = 0; i < tabWraps.length; i++) {
        const tabWrap = tabWraps[i];
        if (tabWrap.getAttribute("data-title-normalized").includes(searchWord)) {
            tabWrap.style.display = "block";
        } else {
            tabWrap.style.display = "none";
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("jumpfocustab").addEventListener("click", () => {
        document.getElementsByClassName("current")[0].scrollIntoView({ behavior: "smooth", block: "center" });
    });

    render();
    document.getElementById("search-text").addEventListener("input", search);
    chrome.tabs.onCreated.addListener(() => render());
    chrome.tabs.onMoved.addListener(() => render());
    chrome.tabs.onActivated.addListener(() => render());
    chrome.tabs.onDetached.addListener(() => render());
    chrome.tabs.onAttached.addListener(() => render());
    chrome.tabs.onRemoved.addListener(() => render());
    chrome.windows.onCreated.addListener(() => render());
    chrome.windows.onFocusChanged.addListener(() => render());
    chrome.windows.onRemoved.addListener(() => render());
});