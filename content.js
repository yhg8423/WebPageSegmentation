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

const findThirdLevelSegments = (html_body, previousSegments) => {
    
    // previousSegments의 segment의 depth를 계산하고, 그 중 max depth를 계산
    let previousMaxDepth = 0;
    console.log(previousSegments);
    if (previousSegments.length > 0) {
        // 각 segment의 depth 계산
        const depths = previousSegments.map(seg => {
            let depth = 0;
            let parent = seg.element.parentElement;
            while (parent) {
                depth++;
                parent = parent.parentElement;
            }
            return depth;
        });
        
        // 최대 depth 계산
        previousMaxDepth = Math.max(...depths);
    }
    console.log("previousMaxDepth: " + previousMaxDepth);


    // 모든 interactive elements와 role 속성을 가진 elements 찾기
    const interactiveElements = Array.from(html_body.querySelectorAll('button, a, input, select, textarea'));
    const roleElements = Array.from(html_body.querySelectorAll('[role="button"], [role="link"], [role="menuitem"], [role="option"], [role="tab"], [role="checkbox"], [role="radio"], [role="switch"], [role="textbox"], [role="combobox"], [role="searchbox"], [role="spinbutton"], [role="slider"]'));
    const allElements = [...interactiveElements, ...roleElements];

    // 이미 first/second level에 포함된 elements 제외
    // const firstLevelSegments = previousSegments.filter(seg => seg.level === 1);
    // const secondLevelSegments = previousSegments.filter(seg => seg.level === 2);
    
    // first와 second level segment에 포함된 elements 찾기
    // const existingElements = new Set();
    // firstLevelSegments.forEach(seg => {
    //     const elements = seg.element.querySelectorAll('button, a, input, select, textarea, [role]');
    //     elements.forEach(el => existingElements.add(el));
    // });
    // secondLevelSegments.forEach(seg => {
    //     const elements = seg.element.querySelectorAll('button, a, input, select, textarea, [role]');
    //     elements.forEach(el => existingElements.add(el));
    // });

    // 이미 존재하는 elements 제외
    // const filteredElements = allElements.filter(el => !existingElements.has(el));
    const filteredElements = allElements;

    // 각 element의 가장 가까운 상위 element 찾기
    let thirdLevelSegments = filteredElements.map(el => {
        let elementDepth = 0;
        let currentElement = el;
        while (currentElement) {
            elementDepth++;
            currentElement = currentElement.parentElement;
        }
        if (elementDepth <= previousMaxDepth) {
            return {
                element: el,
                role: el.getAttribute('role'),
                level: 3,
            };
        }
        
        let parent = el.parentElement;
        parent.dataset.seg_level = 3;
        // // while (parent && parent.tagName.toLowerCase() !== 'div') {
        // //     parent = parent.parentElement;
        // // }
        // // 각 상위 element의 부모 element가 자식으로 상위 element만을 갖는 경우, parent를 그 부모 element로 변경    
        // if (parent && parent.parentElement && parent.parentElement.children.length === 1) {
        //     parent = parent.parentElement;
        // }
        // // 각 상위 element의 부모 element가 자식으로 상위 element를 2개 이상 갖는 경우, parent를 그 부모 element로 변경
        // if (parent && parent.parentElement && parent.parentElement.children.length > 1 &&) {
        //     parent = parent.parentElement;
        // }
        // // console.log(parent);
        return {
            element: parent || el,
            role: el.getAttribute('role'),
            level: 3
        };
    });

    // thirdLevelSegments = thirdLevelSegments.filter(seg => {
    //     // 각 segment의 부모 element가 자식으로 현재의 segment를 갖는 경우, 부모 element를 현재의 segment로 변경
    //     if (seg.element.parentElement && seg.element.parentElement.contains(seg.element)) {
    //         seg.element = seg.element.parentElement;
    //     }
    //     return true;
    // });

    // 부모가 단일 자식만 가지는 경우 부모로 segment 변경
    const getDepthFromBody = (element) => {
        let depth = 0;
        let current = element;
        while (current && current !== document.body) {
            depth++;
            current = current.parentElement;
        }
        return depth;
    };

    const updateSegmentToParent = (segments) => {
        // 깊이 정보를 포함하여 정렬
        let segmentsWithDepth = segments.map(seg => ({
            ...seg,
            depth: getDepthFromBody(seg.element)
        }));
        
        // 최대 깊이 찾기
        const maxDepth = Math.max(...segmentsWithDepth.map(s => s.depth));
        
        let changed = false;
        // 가장 깊은 depth부터 하나씩 처리
        for (let currentDepth = maxDepth; currentDepth > previousMaxDepth; currentDepth--) {
            // 현재 깊이의 세그먼트만 처리
            segments = segmentsWithDepth.map(seg => {
                let current = seg;
                if (current.depth === currentDepth && 
                    current.element.parentElement && 
                    (Array.from(current.element.parentElement.children).filter(child => 
                        child.dataset.seg_level === '3'
                    ).length === 1 || Array.from(current.element.parentElement.children).filter(child => 
                        child.dataset.seg_level === '3'
                    ).length === current.element.parentElement.children.length) &&
                    // !current.element.parentElement.hasAttribute('data-seg_level') &&
                    current.element.parentElement.getAttribute('data-seg_level') !== '2' &&
                    current.element.parentElement.getAttribute('data-seg_level') !== '1' &&
                    !current.element.parentElement.hidden &&
                    current.element.parentElement.getAttribute('aria-hidden') !== 'true' &&
                    window.getComputedStyle(current.element.parentElement).display !== 'none' &&
                    !Array.from(current.element.parentElement.querySelectorAll('*')).some(el => 
                        el !== current.element && el.dataset.seg_level === '3'
                    )
                ) {
                    
                    current.element.dataset.seg_level = null;
                    current.element.parentElement.dataset.seg_level = 3;
                    current = {
                        element: current.element.parentElement,
                        role: current.role,
                        level: current.level,
                        depth: currentDepth - 1
                    };
                    changed = true;
                }
                return current;
            });
            // depth 정보 업데이트
            segmentsWithDepth = segments.map(seg => ({
                ...seg,
                depth: getDepthFromBody(seg.element)
            }));
        }
        
        return { segments, changed };
    };

    // 모든 단일 자식 케이스가 처리될 때까지 반복
    let { segments: updatedSegments, changed } = updateSegmentToParent(thirdLevelSegments);
    // while (changed) {
    //     ({ segments: updatedSegments, changed } = updateSegmentToParent(updatedSegments));
    // }
    thirdLevelSegments = updatedSegments;

    // 가장 깊은 depth부터 하나씩 올라가면서 처리
    // 각 depth에 있는 segment 중, 2개 이상의 segment가 같은 부모를 가질 경우, 부모를 새로운 segment로 추가하고, 원래 있던 segment들은 제거
    
    const processSegmentsByDepth = (segments) => {
        // 깊이 정보를 포함하여 정렬
        let segmentsWithDepth = segments.map(seg => ({
            ...seg,
            depth: getDepthFromBody(seg.element)
        }));
        
        // 최대 깊이 찾기
        const maxDepth = Math.max(...segmentsWithDepth.map(s => s.depth));
        
        // 가장 깊은 depth부터 처리
        for (let currentDepth = maxDepth; currentDepth > previousMaxDepth; currentDepth--) {
            // 부모 엘리먼트별로 현재 깊이의 세그먼트들을 그룹화
            const parentGroups = new Map();
            
            segmentsWithDepth
                .filter(seg => seg.depth === currentDepth)
                .forEach(seg => {
                    const parent = seg.element.parentElement;
                    if (parent && 
                        parent.getAttribute('data-seg_level') !== '1' && 
                        parent.getAttribute('data-seg_level') !== '2') {
                        if (!parentGroups.has(parent)) {
                            parentGroups.set(parent, []);
                        }
                        parentGroups.get(parent).push(seg);
                    }
                });
            
            // 각 부모 그룹 처리
            parentGroups.forEach((groupSegments, parent) => {
                if (groupSegments.length >= 2) {
                    // 기존 세그먼트 제거
                    groupSegments.forEach(seg => {
                        seg.element.dataset.seg_level = null;
                        segmentsWithDepth = segmentsWithDepth.filter(s => s !== seg);
                    });
                    
                    // 부모를 새로운 세그먼트로 추가
                    parent.dataset.seg_level = '3';
                    const newSegment = {
                        element: parent,
                        role: groupSegments[0].role,
                        level: 3,
                        depth: currentDepth - 1
                    };
                    segmentsWithDepth.push(newSegment);
                }
            });
        }
        
        return segmentsWithDepth;
    };

    thirdLevelSegments = processSegmentsByDepth(thirdLevelSegments);
    
    // 부모 엘리먼트별로 segment들을 그룹화하고 depth 정보 추가
    // const processSegmentsByDepth = (segments) => {
    //     const segmentMap = new Map();
    //     segments.forEach(seg => {
    //         const parent = seg.element.parentElement;
    //         if (parent && 
    //             parent.getAttribute('data-seg_level') !== '1' && 
    //             parent.getAttribute('data-seg_level') !== '2') {
    //             if (!segmentMap.has(parent)) {
    //                 segmentMap.set(parent, []);
    //             }
    //             segmentMap.get(parent).push({
    //                 ...seg,
    //                 depth: getDepthFromBody(seg.element)
    //             });
    //         }
    //     });
    //     return segmentMap;
    // };

    // let currentDepth = 0;
    // let hasChanges = true;
    // let processedSegments = thirdLevelSegments;

    // while (hasChanges) {
    //     hasChanges = false;
    //     const segmentMap = processSegmentsByDepth(processedSegments);
    //     const newSegments = [];

    //     segmentMap.forEach((segments, parent) => {
    //         const currentDepthSegs = segments.filter(seg => seg.depth === currentDepth);
            
    //         if (currentDepthSegs.length >= 2) {
    //             // 2개 이상의 segment가 같은 부모를 가질 경우
    //             parent.dataset.seg_level = 3;
    //             currentDepthSegs.forEach(seg => {
    //                 seg.element.dataset.seg_level = null;
    //             });
                
    //             // 새로운 부모 segment 추가
    //             newSegments.push({
    //                 element: parent,
    //                 role: currentDepthSegs[0].role,
    //                 level: 3
    //             });
                
    //             hasChanges = true;
    //         } else {
    //             // 나머지 segment들은 그대로 유지
    //             segments.forEach(seg => {
    //                 if (!currentDepthSegs.includes(seg)) {
    //                     newSegments.push(seg);
    //                 }
    //             });
    //         }
    //     });

    //     if (hasChanges) {
    //         processedSegments = newSegments;
    //         currentDepth++;
    //     }
    // }

    // thirdLevelSegments = processedSegments;

    // 부모 엘리먼트별로 segment들을 그룹화
    // let segmentsByParent = new Map();
    // thirdLevelSegments.forEach(seg => {
    //     const parent = seg.element.parentElement;
    //     if (parent) {
    //         if (!segmentsByParent.has(parent)) {
    //             segmentsByParent.set(parent, []);
    //         }
    //         segmentsByParent.get(parent).push(seg);
    //     }
    // });

    // // 그룹화된 segment들 처리
    // thirdLevelSegments = [];
    // segmentsByParent.forEach((segments, parent) => {
    //     if (segments.length >= 2) {
    //         // 2개 이상의 segment가 같은 부모를 가질 경우, 부모를 새로운 segment로 추가
    //         parent.dataset.seg_level = 3;
    //         segments.forEach(seg => {
    //             seg.element.dataset.seg_level = null;
    //         });
    //         thirdLevelSegments.push({
    //             element: parent,
    //             role: segments[0].role,
    //             level: 3
    //         });
    //     } else {
    //         // 단일 segment는 그대로 유지
    //         thirdLevelSegments.push(...segments);
    //     }
    // });

    return thirdLevelSegments;
};

// const findThirdLevelSegments = (segment) => {
//     // role 속성이 있는 요소 또는 interactive element들을 찾아서 해당 요소와 그 하위 요소들을 세그먼트로 구성
//     const roleElements = Array.from(segment.querySelectorAll('[role]'));
//     const interactiveElements = Array.from(segment.querySelectorAll('button, a, input, select, textarea'));
//     const allElements = [...roleElements, ...interactiveElements];
//     return allElements.map(el => {
//         return {
//             element: el,
//             role: el.getAttribute('role')
//         };
//     });
// }

// Third Level Segemnts는 Second Level Segments 내에서 찾음.
// 각 Second Level Segment 아래에 있는 Interative Elements 또는 role 속성을 가진 element 수를 기준으로
// Second Level Segment 안에서 한 단계 씩 자식 요소를 탐색하는데, 그 자식 요소의 element들이 갖는 Interactive Elements 수가 second level segment의 수보다 작으면서
// 각 자식 요소의 element들이 갖는 interactive elements 또는 role 속성을 가진 element 수가 비슷할 때를 기준으로 하여 segmentation을 진행함.
// const findThirdLevelSegments = (segment) => {
//     // Second Level Segment의 interactive elements와 role 속성 요소 수 계산
//     const parentInteractiveElements = segment.querySelectorAll('button, a, input, select, textarea');
//     const parentRoleElements = segment.querySelectorAll('[role]');
//     const parentTotalElements = parentInteractiveElements.length + parentRoleElements.length;

//     // 자식 요소들을 순회하며 검사
//     const childElements = Array.from(segment.children);
//     let potentialSegments = [];

//     const findPotentialSegmentsRecursive = (elements, depth = 0, maxDepth = 5) => {
//         if (depth >= maxDepth) return null;

//         // 각 자식 요소의 interactive elements와 role 요소 수 확인
//         const segmentCounts = elements.map(child => {
//             const childInteractiveElements = child.querySelectorAll('button, a, input, select, textarea');
//             const childRoleElements = child.querySelectorAll('[role]');
//             return {
//                 element: child,
//                 count: childInteractiveElements.length + childRoleElements.length
//             };
//         });

//         // 부모보다 적은 수의 요소를 가지고 있는 경우들 찾기
//         const validSegments = segmentCounts.filter(item => item.count < parentTotalElements);

//         if (validSegments.length > 1) {
//             // 요소 수가 비슷한지 확인
//             const avgCount = validSegments.reduce((acc, curr) => acc + curr.count, 0) / validSegments.length;
//             const threshold = avgCount * 0.3;
//             const similarSegments = validSegments.filter(segment => 
//                 Math.abs(segment.count - avgCount) <= threshold
//             );

//             if (similarSegments.length > 1) {
//                 return similarSegments;
//             }
//         }

//         // 가장 많은 interactive element를 가진 자식 찾기
//         const maxElement = segmentCounts.reduce((max, curr) => 
//             curr.count > max.count ? curr : max
//         , {count: -1});

//         // 재귀적으로 하위 요소 탐색
//         if (maxElement.element) {
//             return findPotentialSegmentsRecursive(
//                 Array.from(maxElement.element.children),
//                 depth + 1,
//                 maxDepth
//             );
//         }

//         return null;
//     };

//     const result = findPotentialSegmentsRecursive(childElements);
//     return result ? result.map(segment => segment.element) : [];
// }



const highlightSegment = (segment, color) => {
    // segment.style.backgroundColor = color;
    segment.style.border = '2px solid ' + color.replace('0.2', '0.5');
}

const getSegmentContext = (segment) => {
    const cleanSegment = segment.cloneNode(true);
    cleanSegment.querySelectorAll('style, script').forEach(el => el.remove());
    segment = cleanSegment;

    console.log(cleanSegment);

    // 세그먼트의 텍스트 컨텐츠, 이미지 정보 및 추가적인 컨텍스트 정보 수집
    const text = segment.textContent.trim(); 
    const images = segment.getElementsByTagName('img');
    const imageUrls = Array.from(images).map(img => img.src);
    const role = segment.getAttribute('role');
    const ariaLabels = Array.from(segment.querySelectorAll('*')).map(el => el.getAttribute('aria-label')).join(' / ');
    const ariaLabelledBy = segment.getAttribute('aria-labelledby');
    const className = segment.className;
    const title = segment.getAttribute('title');
    const interactiveElements = segment.querySelectorAll('button, a, input, select, textarea, label, form');
    const interactiveElementsText = Array.from(interactiveElements).map(el => {
        let element_contexts = el.textContent.trim();
        if (el.title !== undefined) {
            element_contexts += el.title;
        }
        if (el.placeholder !== undefined) {
            element_contexts += el.placeholder;
        }
        if (el.value !== undefined) {
            element_contexts += el.value;
        }
        if (el.name !== undefined) {
            element_contexts += el.name;
        }
        return element_contexts;
    }).join(' / ');

    return {
        text: text,
        // images: imageUrls,
        role: role,
        ariaLabels: ariaLabels,
        ariaLabelledBy: ariaLabelledBy,
        className: className,
        title: title,
        interactiveElements: interactiveElementsText
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
        // highlightSegment(segment, colors[0]);
        const seg_level = 1;
        segment.dataset.seg_level = seg_level;
        allSegments.push({
            element: segment,
            level: seg_level,
            context: getSegmentContext(segment)
        });
        // 2차 세그멘테이션 
        const secondLevelSegments = findSecondLevelSegments(segment);
        secondLevelSegments.forEach((subSegment) => {
            // highlightSegment(subSegment, colors[1]);
            const seg_level = 2;
            subSegment.dataset.seg_level = seg_level;
            allSegments.push({
                element: subSegment,
                level: seg_level,
                context: getSegmentContext(subSegment)
            });
        });
    });

    // 3차 세그멘테이션
    const thirdLevelSegments = findThirdLevelSegments(document.body, allSegments);
    thirdLevelSegments.forEach((roleSegment) => {
        highlightSegment(roleSegment.element, "rgba(255, 0, 0, 0.2)");
        const seg_level = 3;
        roleSegment.element.dataset.seg_level = seg_level;
        allSegments.push({
            element: roleSegment.element,
            level: seg_level,
            context: getSegmentContext(roleSegment.element)
        });
    });

    console.log(thirdLevelSegments.length);
    
    // thirdLevelSegements를 LLM이 이해하기 쉬운 JSON 형태로 변환
    let segment_id = 0;
    const thirdLevelSegmentsJson = thirdLevelSegments.map(segment => {
        return {
            element: segment.element,
            role: segment.role,
            level: segment.level,
            context: getSegmentContext(segment.element),
            id: segment_id++
        };
    });
    console.log(thirdLevelSegmentsJson);

    const buildElementHierarchy = (element) => {
        const children = Array.from(element.children);
        return {
            tag: element.tagName,
            id: element.id || null,
            class: element.className || null,
            attributes: Array.from(element.attributes).reduce((attrs, attr) => {
                attrs[attr.name] = attr.value;
                return attrs;
            }, {}),
            children: children.map(child => buildElementHierarchy(child)),
        };
    };

    const thirdLevelSegmentsHierarchyJson = thirdLevelSegmentsJson.map(segment => {
        return {
            element: buildElementHierarchy(segment.element),
            context: segment.context,
            role: segment.role,
            id: segment.id,
            level: segment.level,
        };
    });
    // console.log(thirdLevelSegmentsHierarchyJson);

    const thirdLevelSegmentSmall = thirdLevelSegmentsJson.map(segment => {
        return {
            // element: segment.element,
            context: segment.context,
            role: segment.role,
            id: segment.id,
            level: segment.level
        };
    });
    console.log(thirdLevelSegmentSmall);


    // if (firstLevelSegments.length === 0) {
    //     let segment = document.body;
    //     const secondLevelSegments = findSecondLevelSegments(segment);
    //     secondLevelSegments.forEach((subSegment) => {
    //         highlightSegment(subSegment, colors[1]);
    //         allSegments.push({
    //             element: subSegment,
    //             level: 2,
    //             context: getSegmentContext(subSegment)
    //         });

    //         const thirdLevelSegments = findThirdLevelSegments(subSegment);
    //         thirdLevelSegments.forEach((roleSegment) => {
    //             highlightSegment(roleSegment.element, colors[2]);
    //             const context = getSegmentContext(roleSegment.element);
    //             // roleSegment.element.dataset.segmentContext = JSON.stringify(context);
    //             allSegments.push({
    //                 element: roleSegment.element,
    //                 level: 3,
    //                 context: context
    //             });
    //         });
    //     });
    // }
    
    // console.log("document.body.outerHTML: " + document.body.outerHTML);
    // console.log("document.body.outerHTML.length: " + document.body.outerHTML.length);

    // // body에서 script 및 style 태그 제거
    // const bodyWithoutScriptsAndStyles = document.body.outerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    // // console.log("bodyWithoutScriptsAndStyles: " + bodyWithoutScriptsAndStyles);
    // console.log("bodyWithoutScriptsAndStyles.length: " + bodyWithoutScriptsAndStyles.length);

    // // allSegments에서 가장 상위 레벨(level 1)의 element들을 추출
    // const topLevelElements = allSegments.filter(segment => segment.level === 1).map(segment => segment.element);

    // // topLevelElements에서 하위 레벨 segment 또는 interactive element 또는 role 속성을 가진 element만 남김.
    // // 예를 들어, 자식 element는 해당 되지 않지만, 손자 element는 해당되는 경우, 손자 element는 포함하고 자식 element에 해당하는 태그는 제외.
    // // 이렇게 하위 레벨 segment 또는 interactive element 또는 role 속성을 가진 element만 남긴 후, 남은 태그들을 tree 형태로 생성
    // let compressedHtml = topLevelElements.map(element => {
    //     // 하위 요소들을 재귀적으로 처리하는 함수
    //     const processElement = (el) => {
    //         const children = Array.from(el.children);
    //         const validChildren = children.filter(child => {
    //             // 하위 레벨 segment인지 확인
    //             const isSegment = allSegments.some(segment => 
    //                 segment.level > 1 && segment.element === child
    //             );
                
    //             // interactive element인지 확인
    //             const isInteractive = child.matches('button, a, input, select, textarea');
                
    //             // role 속성을 가지고 있는지 확인
    //             const hasRole = child.hasAttribute('role');
                
    //             // 직접적인 자식이 조건을 만족하지 않더라도 손자나 그 하위 모든 요소들 중에 조건을 만족하는 것이 있는지 확인
    //             const hasValidDescendant = Array.from(child.querySelectorAll('*')).some(descendant => {
    //                 // 하위 레벨 segment인지 확인 
    //                 const isDescendantSegment = allSegments.some(segment => 
    //                     segment.level > 1 && segment.element === descendant
    //                 );
    //                 // interactive element이거나 role 속성을 가지고 있는지 확인
    //                 return isDescendantSegment || 
    //                        descendant.matches('button, a, input, select, textarea') || 
    //                        descendant.hasAttribute('role');
    //             });

    //             return isSegment || isInteractive || hasRole || hasValidDescendant;
    //         });

    //         // 유효한 자식 요소들에 대해 재귀적으로 처리
    //         const processedChildren = validChildren.map(child => processElement(child));
            
    //         // HTML 문자열 생성
    //         const tagName = el.tagName.toLowerCase();
    //         const attributes = Array.from(el.attributes)
    //             .map(attr => `${attr.name}="${attr.value}"`)
    //             .join(' ');
                
    //         return `<${tagName}${attributes ? ' ' + attributes : ''}>${
    //             processedChildren.join('')
    //         }</${tagName}>`;
    //     };

    //     return processElement(element);
    // }).join('');

    // // html tag 중 segment 이내 어디에도 포함되지 않은 interactive element 또는 role 속성을 가진 element들을 추출
    // const excludedElements = Array.from(document.querySelectorAll('*')).filter(element => {
    //     // element가 어떤 segment에도 포함되지 않는지 확인
    //     const isNotInSegment = !allSegments.some(segment => 
    //         segment.element.contains(element)
    //     );
        
    //     // interactive element이거나 role 속성을 가지고 있는지 확인
    //     const isInteractiveOrHasRole = element.matches('button, a, input, select, textarea') || 
    //                                  element.hasAttribute('role');
                                     
    //     return isNotInSegment && isInteractiveOrHasRole;
    // });
    // const excludedElementsHtml = excludedElements.map(element => element.outerHTML).join('');
    // console.log("excludedElementsHtml: " + excludedElementsHtml);
    // console.log("excludedElementsHtml.length: " + excludedElementsHtml.length);
    // // 해당 element를 compressedHtml에 추가
    // compressedHtml += excludedElementsHtml;

    // // console.log("compressedHtml: " + compressedHtml);
    // console.log("compressedHtml.length: " + compressedHtml.length);

    // return compressedHtml;

    // interactive elements 및 role 속성을 가진 element들만 추출
    
    return thirdLevelSegmentsHierarchyJson;
    
}