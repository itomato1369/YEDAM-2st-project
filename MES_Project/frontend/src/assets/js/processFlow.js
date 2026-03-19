import axios from 'axios';
import { ref } from 'vue';

const selectedProcessModal = ref([]);

// 순서변경
const applySeqChange = (row) => {
    const list = subProcessData.value; // 이제 원본 배열에 대한 참조입니다.
    // 1. 현재 위치(fromIndex) 찾기

    const fromIndex = list.indexOf(row);
    if (fromIndex === -1) return;

    const currentNo = fromIndex + 1;
    let targetNo = Number(row.poNumber); // 2-1. 숫자가 아니거나, 1보다 작으면 -> 원래 순서로 되돌리고 끝

    if (!Number.isInteger(targetNo) || targetNo < 1) {
        row.poNumber = currentNo;
        return;
    } // 2-2. 입력값이 원래 순서랑 같으면 -> 그냥 아무 것도 안 함

    if (targetNo === currentNo) {
        return;
    } // 3. 범위 보정 (리스트 길이보다 크면 맨 마지막으로)

    const len = list.length;
    if (targetNo > len) targetNo = len;

    const toIndex = targetNo - 1; // 4. 배열에서 해당 row를 빼고 (원본 배열 직접 조작)

    const [moved] = list.splice(fromIndex, 1); // 5. 원하는 위치에 끼워 넣기 (원본 배열 직접 조작)

    list.splice(toIndex, 0, moved); // 6. poNumber 를 1,2,3,... 으로 다시 부여

    list.forEach((item, idx) => {
        // 객체의 속성을 변경하는 것도 반응성
        item.poNumber = idx + 1;
    });

    // 7. 반영
    // 하지만, 마지막에 원본을 **다시 대입하여** Vue의 반응성 시스템에 명확히 알림
    // 또는 `subProcessData.value = [...list];` 처럼 얕게 복사하여 대입
    subProcessData.value = list;
};

// 기준정보 초기화 
const onResetDetailForm = () => ({
    id: null,
    processCode: '',
    processName: '',
    itemCode: '',
    itemName: '',
    processStructure: '',
    reg: '',
    regDate: '',
    remark: ''
});

// Datatalbe 선택
const rowClass = (rowData) => {
    return selectedProcess.value && rowData.id === selectedProcess.value.id ? 'selected-row' : '';
};

// プロジェクトコード・名を照会
const openProcessModal = async () => {
    try {
        const response = await axios.get('/api/process/list');
        processModalList.value = response.data;
        showProcessModal.value = true;
    } catch (error) {
        console.error('プロジェクトコード照会失敗', error.message);
    }
};

// 제품 코드/명 모달호출
const openProcessModal2 = async () => {
    try {
        const response = await axios.get('/api/process/list');
        processModalList2.value = response.data;
        showProcessModal2.value = true;
    } catch (error) {
        console.error('데이터 조회 모달 실패', error.message);
    }
};

// 공정 코드를 클릭하면 po_tbl 공정상세 흐름도 호출
const openProcessDetail = async (rowData) => {
    if (!rowData) {
        console.error('공정 상세 정보 모달 실패');
        return;
    }
    try {
        const response = await axios.get('/api/process/podetail');
        processDetailModalList.value = response.data;
        showPoDetailModal.value = true;
    } catch (error) {
        console.error('공정 상세정보 모달 실패', error.message);
    }
};

// 기준정보의 제품코드/제품명 호출
const openItem = async () => {
    // ProductSearchModal 내부에서 검색 API를 처리 단순히 모달을 열도록
    showProductSearchModal.value = true;
};

// 흐름도 코드/명 값 전달
const selectProcessFromModal = (event) => {
    const row = event.data;
    searchForm.value.processCode = row.processCode;
    searchForm.value.processName = row.processName;

    selectedProcessModal.value = null; // 모달 닫기
    showProcessModal.value = false; //
};
// 제품 코드/명 값 전달
const selectProcessFromModal2 = (event) => {
    const row = event.data;
    searchForm.value.itemCode = row.itemCode;
    searchForm.value.itemName = row.itemName;

    selectedProcessModal2.value = null; // 모달 닫기
    showProcessModal2.value = false;
};
// 초기화
const onResetSearch = () => {
    searchForm.value = {
        processCode: null,
        processName: null,
        itemCode: null,
        itemName: null,
        regDate: null
    };
};
// 기준 정보 값 초기화
const onResetInfo = () => {
    detailForm.value = {
        processCode: null,
        processName: null,
        itemCode: null,
        itemName: null,
        processStructure: null,
        reg: null,
        regDate: null,
        remark: null
    };
};
// 조회
const onSearch = async () => {
    const params = searchForm.value;
    console.log(params);

    const queryParams = Object.keys(params).reduce((acc, key) => {
        const value = params[key];
        if (value !== null && value !== '') {
            acc[key] = value;
        }
        return acc;
    }, {});
    try {
        const response = await axios.get('/api/process/list', { params: queryParams });
        processList.value = response.data;
        console.log('조회 성공:', response.data);
        selectedProcess.value = null;
        detailForm.value = onResetDetailForm();
        subProcessData.value = [];
    } catch (error) {
        console.error('공정 흐름도 목록 조회 실패', error.message);
        processList.value = [];
        detailForm.value = onResetDetailForm();
    }
};

// 공정 흐름도를 선택 시 기준정보에 값이 들어가고 흐름도 상세 조회
const onSelectProcess = async () => {
    const row = selectedProcess.value;

    if (!row) {
        detailForm.value = onResetDetailForm();
        subProcessData.value = [];
        return;
    }

    detailForm.value = { ...row };

    try {
        const response = await axios.get('/api/process/detail', {
            params: { processCode: row.processCode }
        });

        subProcessData.value = response.data.map((item, idx) => ({
            ...item,
            poNumber: item.poNumber ?? idx + 1
        }));
    } catch (error) {
        console.error('흐름도 상세 조회 실패', error.message);
        subProcessData.value = [];
    }
};

// ProductSearchModal에서 제품을 선택했을 때 호출될 핸들러 추가
const onProductSelect = ({ row }) => {
    detailForm.value.itemCode = row.prod_code;
    detailForm.value.itemName = row.prod_name;
};

export { applySeqChange, 
    onResetDetailForm, 
    rowClass, 
    openProcessModal, 
    openProcessModal2,
    openProcessDetail,
    openItem,
    selectProcessFromModal,
    selectProcessFromModal2,
    onResetSearch,
    onResetInfo,
    onSearch,
    onSelectProcess,
    onProductSelect
 }