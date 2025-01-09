// 색상 팔레트 정의
const colors = [
    'rgba(255, 0, 0, 0.2)', // red
    'rgba(0, 255, 0, 0.2)', // green
    'rgba(0, 0, 255, 0.2)', // blue
//     'rgba(255, 255, 0, 0.2)', // yellow
//     'rgba(255, 0, 255, 0.2)', // magenta
//     'rgba(128, 0, 128, 0.2)'
];

const findFirstLevelSegments = () => {
    const body = document.body;
    let segments = [];
    const bodyHeight = document.body.scrollHeight;
    
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
    const findDivGroups = (element) => {
        // body 바로 아래의 div 요소들 찾기
        const divs = Array.from(element.children).filter(el => el.tagName === 'DIV' || el.tagName === 'SECTION' || el.tagName === 'HEADER' || el.tagName === 'FOOTER' || el.tagName === 'MAIN');
        
        // div가 여러개인 경우
        if (divs.length > 1) {
            // 0.9 이상 높이를 가진 div 모두 찾기
            const dominantDivs = divs.filter(div => {
                const rect = div.getBoundingClientRect();
                return (rect.height / bodyHeight) >= 0.9;
            });
            // 0.9 이하 0.1 이상의 높이를 가진 div 모두 찾기
            const smallDivs = divs.filter(div => {
                const rect = div.getBoundingClientRect();
                return (rect.height / bodyHeight) >= 0.1 && (rect.height / bodyHeight) < 0.9;
            });

            // 0.9 이상인 div가 하나만 있으면서 0.1 이상 및 0.9 이하의 높이를 가진 div가 없으면 그 아래에서 다시 찾기
            if (dominantDivs.length === 1 && smallDivs.length === 0) {
                const innerDivs = findDivGroups(dominantDivs[0]);
                if (innerDivs.length > 1) {
                    return innerDivs;
                }
            }
            // 0.9 이상인 div가 여러개인 경우 (width 기반 구분 대응)
            else if (dominantDivs.length > 1) {
                return divs;
            }
            //
            else {
                // divs의 전체 높이 합 중 적어도 하나의 div가 0.9 이상이면 그 아래에서 다시 찾기
                const totalHeight = divs.reduce((sum, div) => sum + div.getBoundingClientRect().height, 0);
                const largeDiv = divs.find(div => {
                    const rect = div.getBoundingClientRect();
                    return (rect.height / totalHeight) >= 0.9;
                });
                console.log(largeDiv);
                if (largeDiv) {
                    const innerDivs = findDivGroups(largeDiv);
                    if (innerDivs.length > 1) {
                        return innerDivs;
                    }
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

const findSecondLevelSegments = (segment) => {
    // 하위 요소들 중 인터랙티브한 요소가 많은 구조 찾기
    const subSegments = Array.from(segment.children).filter(el => {
        const interactiveElements = el.querySelectorAll('button, a, input, select, textarea');
        const hasComplexStructure = el.children.length > 1;
        const hasManyInteractiveElements = interactiveElements.length > 2;
        return (hasComplexStructure && interactiveElements.length > 0) || hasManyInteractiveElements;
    });
    
    return subSegments;
}

const findThirdLevelSegments = (segment) => {
    // role 속성이 있는 요소 또는 interactive element들을 찾아서 해당 요소와 그 하위 요소들을 세그먼트로 구성
    const roleElements = Array.from(segment.querySelectorAll('[role]'));
    const interactiveElements = Array.from(segment.querySelectorAll('button, a, input, select, textarea'));
    const allElements = [...roleElements, ...interactiveElements];
    return allElements.map(el => {
        return {
            element: el,
            role: el.getAttribute('role')
        };
    });
}

const highlightSegment = (segment, color) => {
    segment.style.backgroundColor = color;
    segment.style.border = '2px solid ' + color.replace('0.2', '0.5');
}

const getSegmentContext = (segment) => {
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

// const performSegmentation = () => {
//     // 1차 세그멘테이션
//     const firstLevelSegments = findFirstLevelSegments();
//     firstLevelSegments.forEach((segment, index) => {
//         highlightSegment(segment, colors[index % colors.length]);
        
//         // 2차 세그멘테이션
//         const secondLevelSegments = findSecondLevelSegments(segment);
//         secondLevelSegments.forEach((subSegment, subIndex) => {
//             highlightSegment(subSegment, colors[(index + subIndex + 1) % colors.length]);
            
//             // 3차 세그멘테이션
//             const thirdLevelSegments = findThirdLevelSegments(subSegment);
//             thirdLevelSegments.forEach((roleSegment, roleIndex) => {
//                 highlightSegment(roleSegment.element, colors[(index + subIndex + roleIndex + 2) % colors.length]);
//                 const context = getSegmentContext(roleSegment.element);
//                 roleSegment.element.dataset.segmentContext = JSON.stringify(context);
//             });
            
//             const context = getSegmentContext(subSegment);
//             subSegment.dataset.segmentContext = JSON.stringify(context);
//         });
//     });
// }

const performSegmentation = () => {
    let allSegments = [];

    // 1차 세그멘테이션
    const firstLevelSegments = findFirstLevelSegments();
    firstLevelSegments.forEach((segment) => {
        highlightSegment(segment, colors[0]);
        allSegments.push({
            element: segment,
            level: 1,
            context: getSegmentContext(segment)
        });
        // 2차 세그멘테이션 
        const secondLevelSegments = findSecondLevelSegments(segment);
        secondLevelSegments.forEach((subSegment) => {
            highlightSegment(subSegment, colors[1]);
            allSegments.push({
                element: subSegment,
                level: 2,
                context: getSegmentContext(subSegment)
            });
            
            // 3차 세그멘테이션
            const thirdLevelSegments = findThirdLevelSegments(subSegment);
            thirdLevelSegments.forEach((roleSegment) => {
                highlightSegment(roleSegment.element, colors[2]);
                const context = getSegmentContext(roleSegment.element);
                roleSegment.element.dataset.segmentContext = JSON.stringify(context);
                allSegments.push({
                    element: roleSegment.element,
                    level: 3,
                    context: context
                });
            });
            
            const context = getSegmentContext(subSegment);
            subSegment.dataset.segmentContext = JSON.stringify(context);
        });
    });

    if (firstLevelSegments.length === 0) {
        let segment = document.body;
        const secondLevelSegments = findSecondLevelSegments(segment);
        secondLevelSegments.forEach((subSegment) => {
            highlightSegment(subSegment, colors[1]);
            allSegments.push({
                element: subSegment,
                level: 2,
                context: getSegmentContext(subSegment)
            });

            const thirdLevelSegments = findThirdLevelSegments(subSegment);
            thirdLevelSegments.forEach((roleSegment) => {
                highlightSegment(roleSegment.element, colors[2]);
                const context = getSegmentContext(roleSegment.element);
                roleSegment.element.dataset.segmentContext = JSON.stringify(context);
                allSegments.push({
                    element: roleSegment.element,
                    level: 3,
                    context: context
                });
            });
        });
    }
    // console.log("document.body.outerHTML: " + document.body.outerHTML);
    console.log("document.body.outerHTML.length: " + document.body.outerHTML.length);

    // body에서 script 및 style 태그 제거
    const bodyWithoutScriptsAndStyles = document.body.outerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    // console.log("bodyWithoutScriptsAndStyles: " + bodyWithoutScriptsAndStyles);
    console.log("bodyWithoutScriptsAndStyles.length: " + bodyWithoutScriptsAndStyles.length);

    // allSegments에서 가장 상위 레벨(level 1)의 element들을 추출
    const topLevelElements = allSegments.filter(segment => segment.level === 1).map(segment => segment.element);

    // topLevelElements에서 하위 레벨 segment 또는 interactive element 또는 role 속성을 가진 element만 남김.
    // 예를 들어, 자식 element는 해당 되지 않지만, 손자 element는 해당되는 경우, 손자 element는 포함하고 자식 element에 해당하는 태그는 제외.
    // 이렇게 하위 레벨 segment 또는 interactive element 또는 role 속성을 가진 element만 남긴 후, 남은 태그들을 tree 형태로 생성
    let compressedHtml = topLevelElements.map(element => {
        // 하위 요소들을 재귀적으로 처리하는 함수
        const processElement = (el) => {
            const children = Array.from(el.children);
            const validChildren = children.filter(child => {
                // 하위 레벨 segment인지 확인
                const isSegment = allSegments.some(segment => 
                    segment.level > 1 && segment.element === child
                );
                
                // interactive element인지 확인
                const isInteractive = child.matches('button, a, input, select, textarea');
                
                // role 속성을 가지고 있는지 확인
                const hasRole = child.hasAttribute('role');
                
                // 직접적인 자식이 조건을 만족하지 않더라도 손자나 그 하위 모든 요소들 중에 조건을 만족하는 것이 있는지 확인
                const hasValidDescendant = Array.from(child.querySelectorAll('*')).some(descendant => {
                    // 하위 레벨 segment인지 확인 
                    const isDescendantSegment = allSegments.some(segment => 
                        segment.level > 1 && segment.element === descendant
                    );
                    // interactive element이거나 role 속성을 가지고 있는지 확인
                    return isDescendantSegment || 
                           descendant.matches('button, a, input, select, textarea') || 
                           descendant.hasAttribute('role');
                });

                return isSegment || isInteractive || hasRole || hasValidDescendant;
            });

            // 유효한 자식 요소들에 대해 재귀적으로 처리
            const processedChildren = validChildren.map(child => processElement(child));
            
            // HTML 문자열 생성
            const tagName = el.tagName.toLowerCase();
            const attributes = Array.from(el.attributes)
                .map(attr => `${attr.name}="${attr.value}"`)
                .join(' ');
                
            return `<${tagName}${attributes ? ' ' + attributes : ''}>${
                processedChildren.join('')
            }</${tagName}>`;
        };

        return processElement(element);
    }).join('');

    // html tag 중 segment 이내 어디에도 포함되지 않은 interactive element 또는 role 속성을 가진 element들을 추출
    const excludedElements = Array.from(document.querySelectorAll('*')).filter(element => {
        // element가 어떤 segment에도 포함되지 않는지 확인
        const isNotInSegment = !allSegments.some(segment => 
            segment.element.contains(element)
        );
        
        // interactive element이거나 role 속성을 가지고 있는지 확인
        const isInteractiveOrHasRole = element.matches('button, a, input, select, textarea') || 
                                     element.hasAttribute('role');
                                     
        return isNotInSegment && isInteractiveOrHasRole;
    });
    const excludedElementsHtml = excludedElements.map(element => element.outerHTML).join('');
    console.log("excludedElementsHtml: " + excludedElementsHtml);
    console.log("excludedElementsHtml.length: " + excludedElementsHtml.length);
    // 해당 element를 compressedHtml에 추가
    compressedHtml += excludedElementsHtml;

    // console.log("compressedHtml: " + compressedHtml);
    console.log("compressedHtml.length: " + compressedHtml.length);

    return compressedHtml;
}