<script setup>
// Vue의 반응성을 부여하기 위해 ref함수를 가져옴
import { ref } from 'vue';
// 전체 제품 품목 조회
import ProductSearchModal from '@/components/order/ProductSelectModal.vue';
// function import
import { applySeqChange, 
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
 } from '@/assets/js/processFlow.js';

// PrimeVue 컴포넌트는 전역 등록되어 있다고 가정 (Sakai 템플릿 기본 구조)
// 조회 필드
const searchForm = ref({
    processCode: '',
    processName: '',
    itemCode: '',
    itemName: '',
    regDate: null
});

// 공정 흐름도
const processList = ref([]);

// 공정 흐름도
const selectedProcess = ref(null);

// 흐름도 상세
const subProcessData = ref([]);
const selectedSubProcess = ref([]);

// 공형분류
const processStructureOptions = [
    { label: '비정형', value: 'p1' },
    { label: '정형', value: 'p2' }
];


// 기준정보
const detailForm = ref(onResetDetailForm());

// -------------------------------
// 모달 데이터
// -------------------------------
const showProcessModal = ref(false); // 흐름도 코드/명 모달 호출
const processModalList = ref([]); // 모달 데이터

const showProcessModal2 = ref(false); // 제품 코드/명 모달 호출
const processModalList2 = ref([]); // 모달 데이터

const showPoDetailModal = ref(false);
const processDetailModalList = ref([]); // 모달 데이터

const showProductSearchModal = ref(false); // ProductSearchModal 모달

const selectedProcessModal = ref([]);
const selectedProcessModal2 = ref([]);


</script>

<template>
    <div class="p-fluid process-page">
        <!-- 상단 헤더(화면ID, 화면명 등)는 공통 레이아웃에서 처리한다고 보고 생략 -->
        <!-- 검색 영역 -->
        <div class="card search-panel">
            <div class="search-row">
                <div class="field">
                    <label for="processCode">흐름도코드</label>
                    <InputText id="processCode" 
                               v-model="searchForm.processCode" 
                               placeholder="흐름도코드 선택" 
                               readonly 
                               @click="openProcessModal" />
                </div>

                <div class="field">
                    <label for="processName">흐름도명</label>
                    <InputText id="processName" 
                               v-model="searchForm.processName" 
                               placeholder="흐름도명 선택" 
                               readonly
                               @click="openProcessModal" />
                </div>

                <div class="field">
                    <label for="itemCode">제품코드</label>
                    <InputText id="itemCode" 
                               v-model="searchForm.itemCode" 
                               placeholder="제품코드 선택" 
                               readonly 
                               @click="openProcessModal2" />
                </div>

                <div class="field">
                    <label for="itemName">제품명</label>
                    <InputText id="itemName"
                               v-model="searchForm.itemName" 
                               placeholder="제품명 선택"
                               readonly 
                               @click="openProcessModal2" />
                </div>

                <div class="field date-range-field flex flex-column">
                    <label class="mb-1">등록일자</label>

                    <div class="align-items-center gap-2">
                        <Calendar v-model="searchForm.regDate" 
                                  dateFormat="yy-mm-dd" 
                                  :showIcon="true" 
                                  class="w-full" />
                    </div>
                </div>
            </div>

            <div class="field button-group">
                <Button label="초기화" class="p-button-secondary" @click="onResetSearch" />
                <Button label="조회" class="p-button-warning" @click="onSearch" />
            </div>
        </div>

        <!-- 흐름도 코드/명 모달 -->
        <Dialog v-model:visible="showProcessModal" header="흐름도 코드/명 선택" modal>
            <DataTable :value="processModalList" 
                        v-model:selection="selectedProcessModal" 
                        selectionMode="single" 
                        @rowSelect="selectProcessFromModal" 
                        :paginator="true" 
                        :rows="10">
                <Column field="processCode" header="흐름도코드"></Column>
                <Column field="processName" header="흐름도명"></Column>
            </DataTable>
        </Dialog>

        <!-- 제품 코드/명 모달 -->
        <Dialog v-model:visible="showProcessModal2" header="제품 코드/명 선택" modal>
            <DataTable :value="processModalList2" 
                       v-model:selection="selectedProcessModal2" 
                       selectionMode="single" 
                       @rowSelect="selectProcessFromModal2" 
                       :paginator="true" 
                       :rows="10">
                <Column field="itemCode" header="제품코드"></Column>
                <Column field="itemName" header="제품명"></Column>
            </DataTable>
        </Dialog>

        <div class="card process-card">
            <div class="content-layout">
                <!-- 좌측: 공정 흐름도 -->
                <div class="left-pane">
                    <!-- 검색 결과 헤더 -->
                    <div class="list-header">
                        <span>공정흐름도</span>
                        <div>검색 결과 {{ processList.length }}건</div>
                        <div class="list-header-buttons">
                            <Button label="삭제" 
                                    class="p-button-danger p-button-sm" 
                                    :disabled="!selectedProcess" 
                                    @click="onDeleteProcess" />
                        </div>
                    </div>

                    <!-- 공정 흐름도 그리드 -->
                    <DataTable :value="processList" dataKey="id" selectionMode="single" v-model:selection="selectedProcess" @rowSelect="onSelectProcess" scrollable scrollHeight="220px" class="p-datatable-sm process-list-table" :rowClass="rowClass">
                        <Column field="processCode" header="흐름도코드" style="width: 90px"></Column>
                        <Column field="processName" header="흐름도명" style="width: 130px"></Column>
                        <Column field="itemCode" header="제품코드" style="width: 90px"></Column>
                        <Column field="itemName" header="제품명" style="width: 90px"></Column>
                        <Column field="regDate" header="등록일자" style="width: 100px">
                            <template #body="{ data }">{{ data.regDate ? data.regDate.slice(0, 10) : '' }}</template></Column
                        >
                        <Column field="remark" header="비고" style="width: 150px"></Column>
                    </DataTable>

                    <!-- 좌하단: 흐름도 상세 -->

                    <div class="sub-process-header">
                        <span>흐름도 상세</span>
                        <div class="sub-process-buttons">
                            <Button label="행 추가" class="p-button-outlined p-button-sm" @click="onAddSubProcess" />
                            <Button label="삭제" class="p-button-danger p-button-sm" :disabled="selectedSubProcess.length === 0" @click="onDeleteSubProcess" />
                        </div>
                    </div>

                    <div class="sub-process-wrapper">
                        <DataTable :value="subProcessData" dataKey="subProcessData" v-model:selection="selectedSubProcess" scrollable scrollHeight="220px" selectionMode="single" class="p-datatable-sm sub-process-table">
                            <Column selectionMode="multiple" headerStyle="width:3rem"></Column>
                            <!-- 공정순서: 숫자 입력 -->
                            <Column field="poNumber" header="공정순서" style="width: 60px">
                                <template #body="{ data }">
                                    <InputNumber v-model="data.poNumber" :min="1" :useGrouping="false" style="width: 60px" @keyup.enter="applySeqChange(data)" />
                                </template>
                            </Column>

                            <!-- 공정코드 + 돋보기 버튼 -->
                            <Column field="poCode" header="공정코드" style="width: 120px">
                                <template #body="{ data }">
                                    <div class="flex align-items-center gap-2">
                                        <InputText v-model="data.poCode" disabled style="width: 120px" /><Button icon="pi pi-search" class="p-button-text p-button-sm" @click="openProcessDetail(data)" />
                                    </div> </template
                            ></Column>
                            <Column field="poName" header="공정명" style="width: 100px"> </Column>
                            <Column field="machine" header="설비유형" style="width: 120px"> </Column>
                        </DataTable>
                    </div>
                </div>

                <Dialog v-model:visible="showPoDetailModal" header="흐름도 코드/명 선택" modal>
                    <DataTable :value="processDetailModalList" :paginator="true" :rows="10">
                        <Column field="poCode" header="공정코드"></Column>
                        <Column field="poName" header="공정명"></Column>
                        <Column field="remark" header="비고"></Column>
                        <Column field="qcr" header="품질검사코드"></Column>
                    </DataTable>
                </Dialog>

                <!-- 우측: 기준정보 영역 -->
                <div class="right-pane">
                    <div class="right-header">
                        <div class="flex-gap"></div>
                        <span>기준정보</span>
                        <div class="right-header-buttons">
                            <Button label="초기화" class="p-button-secondary p-button-sm" @click="onResetInfo" />
                            <Button label="등록" class="p-button-success p-button-sm" @click="onCreate" />
                            <Button label="수정" class="p-button-primary p-button-sm" :disabled="!detailForm.id" @click="onUpdate" />
                        </div>
                    </div>

                    <div class="detail-form">
                        <div class="form-grid">
                            <div class="field">
                                <label>제품공정 흐름도 코드</label>
                                <InputText v-model="detailForm.processCode" placeholder="자동입력" disabled />
                            </div>

                            <div class="field">
                                <label>제품 흐름도명</label>
                                <InputText v-model="detailForm.processName" placeholder="자동입력" />
                            </div>

                            <div class="field">
                                <label>제품코드</label>
                                <InputText v-model="detailForm.itemCode" @click="openItem" readonly placeholder="자동입력" />
                            </div>

                            <div class="field">
                                <label>제품명</label>
                                <InputText v-model="detailForm.itemName" @click="openItem" readonly placeholder="자동입력" />
                            </div>

                            <div class="field">
                                <label>공형분류</label>
                                <Dropdown v-model="detailForm.processStructure" :options="processStructureOptions" optionLabel="label" optionValue="value" placeholder="정형/비정형" />
                            </div>

                            <div class="field">
                                <label>등록자</label>
                                <div class="p-inputgroup">
                                    <InputText v-model="detailForm.reg" placeholder="자동입력" disabled />
                                </div>
                            </div>

                            <div class="field">
                                <label>등록일자</label>
                                <InputText :value="detailForm.regDate ? detailForm.regDate.slice(0, 10) : ''" />
                            </div>

                            <div class="field full-width">
                                <label>비고</label>
                                <Textarea v-model="detailForm.remark" :rows="4" autoResize placeholder="특이사항이 있는 경우 입력합니다." />
                            </div>
                        </div>
                    </div>

                    <ProductSearchModal v-model="showProductSearchModal" @select="onProductSelect" :currentIndex="-1" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import '@/assets/css/processFlow.css';
</style>
