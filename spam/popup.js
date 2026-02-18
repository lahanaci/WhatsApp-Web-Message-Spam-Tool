document.getElementById('startBtn').addEventListener('click', async () => {
    const message = document.getElementById('msg').value;
    const count = parseInt(document.getElementById('count').value);
    const delay = parseFloat(document.getElementById('delay').value);
    const randomSuffix = document.getElementById('randomSuffix').checked;

    if (!message) {
        alert("Please enter a message.");
        return;
    }

    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    
    if (!tab.url.includes("web.whatsapp.com")) {
        alert("This extension works only on WhatsApp Web (web.whatsapp.com).");
        return;
    }

    
    toggleButtons(true);

    
    chrome.tabs.sendMessage(tab.id, {
        action: "START",
        data: { message, count, delay, randomSuffix }
    }, (response) => {
        
        if (chrome.runtime.lastError) {
            console.error("Bağlantı Hatası:", chrome.runtime.lastError.message);
            alert("⚠️ Error: Connection failed.\n\nPlease refresh WhatsApp Web (F5) and try again.");
            toggleButtons(false);
        }
    });
});

document.getElementById('stopBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
        chrome.tabs.sendMessage(tab.id, { action: "STOP" }, (response) => {
            if (chrome.runtime.lastError) {
                
                console.log("Durdurma sinyali gönderilemedi (Sekme kapalı veya script yok).");
            }
        });
    }
    toggleButtons(false);
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.status === "COMPLETE") {
        toggleButtons(false);
    }
});

function toggleButtons(isRunning) {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    if (startBtn && stopBtn) {
        startBtn.style.display = isRunning ? 'none' : 'block';
        stopBtn.style.display = isRunning ? 'block' : 'none';
    }

}
