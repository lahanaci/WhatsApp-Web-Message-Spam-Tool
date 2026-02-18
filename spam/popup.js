document.getElementById('startBtn').addEventListener('click', async () => {
    const message = document.getElementById('msg').value;
    const count = parseInt(document.getElementById('count').value);
    const delay = parseFloat(document.getElementById('delay').value);
    const randomSuffix = document.getElementById('randomSuffix').checked;

    if (!message) {
        alert("Lütfen bir mesaj girin.");
        return;
    }

    // Aktif sekmeyi bul
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // URL Kontrolü
    if (!tab.url.includes("web.whatsapp.com")) {
        alert("Bu eklenti sadece WhatsApp Web (web.whatsapp.com) üzerinde çalışır.");
        return;
    }

    // UI Güncelle
    toggleButtons(true);

    // Mesaj Gönderimi ve Hata Yakalama (DÜZELTME BURADA)
    chrome.tabs.sendMessage(tab.id, {
        action: "START",
        data: { message, count, delay, randomSuffix }
    }, (response) => {
        // Eğer content.js cevap vermezse (Script yüklenmemişse)
        if (chrome.runtime.lastError) {
            console.error("Bağlantı Hatası:", chrome.runtime.lastError.message);
            alert("⚠️ Hata: Bağlantı kurulamadı.\n\nLütfen WhatsApp Web sayfasını YENİLEYİN (F5) ve tekrar deneyin.");
            toggleButtons(false);
        }
    });
});

document.getElementById('stopBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
        chrome.tabs.sendMessage(tab.id, { action: "STOP" }, (response) => {
            if (chrome.runtime.lastError) {
                // Sessizce geçiştir, zaten durmuş olabilir.
                console.log("Durdurma sinyali gönderilemedi (Sekme kapalı veya script yok).");
            }
        });
    }
    toggleButtons(false);
});

// Content script'ten gelen "Bitti" mesajını dinle
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