// 1. 데이터를 담을 가방 (모듈 내부 변수)
let petDatabase = [];

/**
 * 외부에서 데이터를 원격으로 가져와 정제하는 함수
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