
let isRunning = false;


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

       
        const inputCandidates = document.querySelectorAll('div[contenteditable="true"][data-tab]');
        
        
        let mainInput = null;
        
        
        if(inputCandidates.length > 0) {
             mainInput = inputCandidates[inputCandidates.length - 1];
        }

        if (!mainInput) {
            console.error("Sohbet kutusu bulunamadı! Lütfen bir sohbeti açın.");
            alert("Hata: Açık bir sohbet bulunamadı.");
            isRunning = false;
            break;
        }

        
        let finalMessage = message;
        if (randomSuffix) {
            finalMessage += ` [${Math.floor(Math.random() * 1000)}]`;
        }

        
        mainInput.focus();
        
        
        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', finalMessage);

        
        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: dataTransfer,
            bubbles: true,
            cancelable: true
        });
        
        mainInput.dispatchEvent(pasteEvent);

        
        await sleep(200);

        
        const enterEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            keyCode: 13,
            which: 13,
            key: 'Enter',
            code: 'Enter'
        });
        
        mainInput.dispatchEvent(enterEvent);

       

        console.log(`Mesaj ${i + 1}/${count} gönderildi.`);

        
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
