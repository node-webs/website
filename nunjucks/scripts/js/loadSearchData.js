// 1. 데이터를 담을 가방 (모듈 내부 변수)
let petDatabase = [];
let eventDatabase = [];

/**
 * 외부에서 품종 데이터를 원격으로 가져와 정제하는 함수
 */
export const loadPetDatabase = async (searchInput) => {
    try {
        const response = await fetch('/script/json/pets.json'); 
        if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
        
        const rawData = await response.json();
        
        // 데이터 가공 및 저장
        petDatabase = rawData.map(item => ({
            type: item.type,
            characteristics: item.characteristics,
            origin: item.origin,
            weight_range: item.weight_range,
            name: {
                ko: item.nameKo,
                en: item.nameEn
            }
        }));

        // 로딩 완료 후 입력창 활성화
        searchInput.disabled = false;
        searchInput.placeholder = "품종을 검색해보세요! (Maltese, 말티즈)";
    } catch (error) {
        console.error('에러 발생:', error);
        searchInput.placeholder = "데이터를 불러올 수 없습니다.";
    }
};

/**
 * 입력된 키워드로 품종을 필터링하여 결과를 반환하는 함수
 */
export const filterPets = (keyword) => {
    const cleanKeyword = keyword.trim().toLowerCase();
    
    // 입력값이 비어있으면 빈 배열 반환
    if (!cleanKeyword) return [];

    // 국문/영문 이름에 키워드가 포함되었는지 필터링
    return petDatabase.filter(pet => 
        pet.name.ko.toLowerCase().includes(cleanKeyword) || 
        pet.name.en.toLowerCase().includes(cleanKeyword)
    );
};

/**
 * 3) 🌟 외부에서 이벤트 데이터를 원격으로 가져오는 함수
 */
export const loadEventDatabase = async () => {
    try {
        const response = await fetch('/script/json/events.json'); 
        if (!response.ok) throw new Error('이벤트 데이터를 불러오는데 실패했습니다.');
        
        eventDatabase = await response.json();
    } catch (error) {
        console.error('이벤트 에러 발생:', error);
    }
};

/**
 * 4) 🌟 감지된 타입들(dog, cat)에 매칭되는 이벤트들만 필터링하는 함수
 * 품종 검색 결과(타입)에 맞춰 이벤트를 가져오는 함수
 */
export const filterEventsByType = (types) => {
    // types 배열(예: ['dog'])에 포함된 target을 가진 이벤트만 필터링하여 반환
    return eventDatabase.filter(event => types.includes(event.target));
};

/**
 * 5) 🌟 입력된 키워드가 '이벤트 제목'이나 '배지 이름'에 포함되어 있는지 검사하는 함수
 */
export const filterEventsByKeyword = (keyword) => {
    if (!keyword) return [];
    
    // 앞뒤 공백을 완전히 제거하고 소문자화 (한글은 소문자화해도 그대로 유지됨)
    const cleanKeyword = keyword.trim().toLowerCase();
    
    // 키워드가 빈 문자열이면 빈 배열 반환
    if (cleanKeyword === "") return [];

    return eventDatabase.filter(event => {
        const titleMatch = event.title && event.title.toLowerCase().includes(cleanKeyword);
        const badgeMatch = event.badge && event.badge.toLowerCase().includes(cleanKeyword);
        
        return titleMatch || badgeMatch;
    });
};