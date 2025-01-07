chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
            // content.js에 정의된 함수 실행
            performSegmentation();
        }
    });
});
