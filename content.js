// 색상 팔레트 정의
const colors = [
    'rgba(255, 0, 0, 0.2)',
    'rgba(0, 255, 0, 0.2)',
    'rgba(0, 0, 255, 0.2)',
    'rgba(255, 255, 0, 0.2)',
    'rgba(255, 0, 255, 0.2)'
];

function findFirstLevelSegments() {
    const body = document.body;
    let segments = [];
    
    // body > div 구조에서 첫 번째로 여러 개의 div가 나오는 레벨 찾기
    function findDivGroups(element, depth = 0) {
        const divs = Array.from(element.children).filter(el => el.tagName === 'DIV');
        
        if (divs.length > 1) {
            return divs;
        }
        
        for (const child of divs) {
            const result = findDivGroups(child, depth + 1);
            if (result.length > 1) {
                return result;
            }
        }
        
        return [];
    }
    
    const firstLevelDivs = findDivGroups(body);
    return firstLevelDivs;
}

function findSecondLevelSegments(segment) {
    // 하위 요소들 중 인터랙티브한 요소가 많은 구조 찾기
    const subSegments = Array.from(segment.children).filter(el => {
        const interactiveElements = el.querySelectorAll('button, a, input, select, textarea');
        const hasComplexStructure = el.children.length > 1;
        return hasComplexStructure && interactiveElements.length > 0;
    });
    
    return subSegments;
}

function highlightSegment(segment, color) {
    segment.style.backgroundColor = color;
    segment.style.border = '2px solid ' + color.replace('0.2', '0.5');
}

function getSegmentContext(segment) {
    // 세그먼트의 텍스트 컨텐츠 및 이미지 정보 수집
    const text = segment.textContent.trim();
    const images = segment.getElementsByTagName('img');
    const imageUrls = Array.from(images).map(img => img.src);
    
    return {
        text: text,
        images: imageUrls
    };
}

function performSegmentation() {
    // 1차 세그멘테이션
    const firstLevelSegments = findFirstLevelSegments();
    firstLevelSegments.forEach((segment, index) => {
        highlightSegment(segment, colors[index % colors.length]);
        
        // 2차 세그멘테이션
        const secondLevelSegments = findSecondLevelSegments(segment);
        secondLevelSegments.forEach((subSegment, subIndex) => {
            highlightSegment(subSegment, colors[(index + subIndex + 1) % colors.length]);
            const context = getSegmentContext(subSegment);
            // context 정보를 데이터 속성으로 저장
            subSegment.dataset.segmentContext = JSON.stringify(context);
        });
    });
}
