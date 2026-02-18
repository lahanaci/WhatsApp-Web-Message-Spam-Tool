// Global değişkenler (Durdurma işlemi için)
let isRunning = false;

// Popup'tan gelen mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START") {
        if (isRunning) {
            console.warn("Zaten çalışan bir işlem var.");
            return;
        }
        isRunning = true;
        startSendingProcess(request.data);
    } else if (request.action === "STOP") {
        isRunning = false;
        console.log("İşlem kullanıcı tarafından durduruldu.");
    }
});

async function startSendingProcess(config) {
    const { message, count, delay, randomSuffix } = config;
    
    console.log("Gönderim Başlıyor...", config);

    for (let i = 0; i < count; i++) {
        if (!isRunning) break;

        // 1. Yazı alanını bul (Selector WhatsApp güncellemelerine karşı dirençlidir)
        // [contenteditable="true"] en güvenilir seçicidir.
        const inputCandidates = document.querySelectorAll('div[contenteditable="true"][data-tab]');
        
        // Genellikle 2. veya sonuncusu ana sohbet inputudur (Alıntı vb. yoksa)
        let mainInput = null;
        
        // Basit heuristik: Genellikle en sonuncusu veya 10 numaralı tab index'e sahip olan
        if(inputCandidates.length > 0) {
             mainInput = inputCandidates[inputCandidates.length - 1];
        }

        if (!mainInput) {
            console.error("Sohbet kutusu bulunamadı! Lütfen bir sohbeti açın.");
            alert("Hata: Açık bir sohbet bulunamadı.");
            isRunning = false;
            break;
        }

        // 2. Mesajı hazırla
        let finalMessage = message;
        if (randomSuffix) {
            finalMessage += ` [${Math.floor(Math.random() * 1000)}]`;
        }

        // 3. İNSAN SİMÜLASYONU: Paste Event Tetikleme
        // Bu yöntem React state'ini günceller ve butonu aktifleştirir.
        mainInput.focus();
        
        // Clipboard verisi oluştur
        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', finalMessage);

        // Paste eventini dispatch et
        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: dataTransfer,
            bubbles: true,
            cancelable: true
        });
        
        mainInput.dispatchEvent(pasteEvent);

        // 4. Kısa bekleme (React'in işlemesi için)
        await sleep(200);

        // 5. ENTER Tuşuna Bas (Gönderme)
        const enterEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            keyCode: 13,
            which: 13,
            key: 'Enter',
            code: 'Enter'
        });
        
        mainInput.dispatchEvent(enterEvent);

        // Alternatif: Enter çalışmazsa "Gönder" butonuna tıklamayı dener
        // await sleep(100);
        // const sendBtn = document.querySelector('button[aria-label="Send"]'); // Selector değişebilir
        // if(sendBtn) sendBtn.click();

        console.log(`Mesaj ${i + 1}/${count} gönderildi.`);

        // 6. Sonraki mesaj için bekle
        if (i < count - 1) {
            await sleep(delay * 1000);
        }
    }

    isRunning = false;
    console.log("Gönderim tamamlandı.");
    chrome.runtime.sendMessage({status: "COMPLETE"});
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}