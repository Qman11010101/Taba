document.addEventListener("DOMContentLoaded", function () {
    // Initialization
    const tabsAll = document.getElementById("tabs-all");
    // while (tabsAll.firstChild) tabsAll.removeChild(tabsAll.firstChild);

    chrome.tabs.query({}, function (tabs) {
        document.getElementById("tab-count").innerText = tabs.length;
        
        // Get active tab to get active window
        let activeWindowId;
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].active) {
                activeWindowId = tabs[i].windowId;
                break;
            }
        }

        // Sort tabs by url
        tabs.sort(function (a, b) {
            if (a.url < b.url) return -1;
            if (a.url > b.url) return 1;
            return 0;
        });
        tabs.forEach(function (tab) {
            const tabDiv = tabsAll.appendChild(document.createElement("div"));
            tabDiv.className = "tab-wrap";
            tabDiv.classList.add(tab.windowId === activeWindowId  ? "active" : "inactive")
            tabDiv.id = tab.id;
            tabDiv.setAttribute("data-title-normalized", tab.title.normalize("NFKC").toLowerCase().replaceAll(" ", ""));

            // Tab title block
            const tabTitleBlock = tabDiv.appendChild(document.createElement("div"));
            tabTitleBlock.className = "tab-title-block";
            const tabTitle = tabTitleBlock.appendChild(document.createElement("div"));
            tabTitle.innerText = tab.title;
            tabTitle.className = "tab-title";
            const tabFocusBtn = tabTitleBlock.appendChild(document.createElement("button"));
            tabFocusBtn.className = "tab-btn";
            tabFocusBtn.innerText = "Focus";
            const tabCloseBtn = tabTitleBlock.appendChild(document.createElement("button"));
            tabCloseBtn.className = "tab-btn";
            tabCloseBtn.innerText = "Close";
        });
    });
});
