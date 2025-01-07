// 색상 팔레트 정의
const colors = [
    'rgba(255, 0, 0, 0.2)',
    'rgba(0, 255, 0, 0.2)', 
    'rgba(0, 0, 255, 0.2)',
    'rgba(255, 255, 0, 0.2)',
    'rgba(255, 0, 255, 0.2)',
    'rgba(128, 0, 128, 0.2)'
];

function findFirstLevelSegments() {
    const body = document.body;
    let segments = [];
    const windowHeight = document.body.scrollHeight;
    
    // header, main, footer 태그 찾기
    const header = body.querySelector('header');
    const main = body.querySelector('main');
    const footer = body.querySelector('footer');
    
    // header, main, footer가 모두 있는 경우
    if (header && main && footer) {
        segments = [header, main, footer];
        return segments;
    }
    
    // header, main, footer가 없는 경우 div로 구분
    function findDivGroups(element) {
        // body 바로 아래의 div 요소들 찾기
        const divs = Array.from(element.children).filter(el => el.tagName === 'DIV');
        
        // div가 여러개인 경우
        if (divs.length > 1) {
            // 0.9 이상 높이를 가진 div 찾기
            const dominantDiv = divs.find(div => {
                const rect = div.getBoundingClientRect();
                return (rect.height / windowHeight) >= 0.9;
            });
            
            // 0.9 이상인 div가 있으면 그 아래에서 다시 찾기
            if (dominantDiv) {
                const innerDivs = findDivGroups(dominantDiv);
                if (innerDivs.length > 1) {
                    return innerDivs;
                }
            }
            
            // 0.9 이상인게 없으면 현재 div들 반환
            return divs;
        }

        // div가 하나인 경우에는 그 하나 아래에서 다시 찾음
        else {
            const innerDivs = findDivGroups(divs[0]);
            if (innerDivs.length > 1) {
                return innerDivs;
            }
            else {
                return divs;
            }
        }
    }
    
    const firstLevelDivs = findDivGroups(body);
    return firstLevelDivs.length > 0 ? firstLevelDivs : [body];
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

function findThirdLevelSegments(segment) {
    // role 속성이 있는 요소들을 찾아서 해당 요소와 그 하위 요소들을 세그먼트로 구성
    const roleElements = Array.from(segment.querySelectorAll('[role]'));
    return roleElements.map(el => {
        return {
            element: el,
            role: el.getAttribute('role')
        };
    });
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
    const role = segment.getAttribute('role');
    
    return {
        text: text,
        images: imageUrls,
        role: role
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
            
            // 3차 세그멘테이션
            const thirdLevelSegments = findThirdLevelSegments(subSegment);
            thirdLevelSegments.forEach((roleSegment, roleIndex) => {
                highlightSegment(roleSegment.element, colors[(index + subIndex + roleIndex + 2) % colors.length]);
                const context = getSegmentContext(roleSegment.element);
                roleSegment.element.dataset.segmentContext = JSON.stringify(context);
            });
            
            const context = getSegmentContext(subSegment);
            subSegment.dataset.segmentContext = JSON.stringify(context);
        });
    });
}
