/* ==================== 公共JavaScript函数 ==================== */

// ==================== 工具函数 ====================
const Utils = {
    generateId: function() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};

// ==================== 分页模板渲染 ====================
const PaginationTemplate = {
    render: function(pageType, currentPage, totalPages, totalCount, pageSize, selectedCount = 0) {
        let pageButtons = '';
        const maxVisiblePages = 7;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageButtons += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage('${pageType}', ${i})">${i}</button>`;
            }
        } else {
            pageButtons += `<button class="${1 === currentPage ? 'active' : ''}" onclick="goToPage('${pageType}', 1)">1</button>`;
            if (currentPage > 3) {
                pageButtons += '<span>...</span>';
            }
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pageButtons += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage('${pageType}', ${i})">${i}</button>`;
            }
            if (currentPage < totalPages - 2) {
                pageButtons += '<span>...</span>';
            }
            pageButtons += `<button onclick="goToPage('${pageType}', ${totalPages})">${totalPages}</button>`;
        }

        return `
            <div class="pagination-info">已选择 ${selectedCount} 项 本页 ${pageSize} 条 共有 ${totalCount} 条</div>
            <div class="pagination-nav">
                <select class="pagination-select" onchange="changePageSize('${pageType}', this.value)">
                    <option value="10" ${pageSize == 10 ? 'selected' : ''}>10条/页</option>
                    <option value="20" ${pageSize == 20 ? 'selected' : ''}>20条/页</option>
                    <option value="50" ${pageSize == 50 ? 'selected' : ''}>50条/页</option>
                </select>
                <button ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage('${pageType}', ${currentPage - 1})">◀</button>
                ${pageButtons}
                <button ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage('${pageType}', ${currentPage + 1})">▶</button>
                <span style="margin-left:10px">跳转至</span>
                <input type="text" style="width:50px;padding:4px;border:1px solid #d9d9d9;border-radius:3px;" onkeypress="handlePageInput(event, '${pageType}')">
            </div>
        `;
    }
};

// ==================== 页面管理 ====================
const PageManager = {
    data: {},
    currentPage: {},
    pageSize: {},

    init: function(pageType, data) {
        if (!this.currentPage[pageType]) {
            this.currentPage[pageType] = 1;
        }
        if (!this.pageSize[pageType]) {
            this.pageSize[pageType] = 10;
        }
        if (!this.data[pageType]) {
            this.data[pageType] = data;
        }
    },

    getPageData: function(pageType) {
        const start = (this.currentPage[pageType] - 1) * this.pageSize[pageType];
        const end = start + this.pageSize[pageType];
        return this.data[pageType].slice(start, end);
    },

    getTotalPages: function(pageType) {
        return Math.ceil(this.data[pageType].length / this.pageSize[pageType]);
    },

    goToPage: function(pageType, page) {
        const totalPages = this.getTotalPages(pageType);
        if (page < 1 || page > totalPages) return;
        this.currentPage[pageType] = page;
        if (typeof renderTable === 'function') {
            renderTable(pageType);
        }
        if (typeof renderPagination === 'function') {
            renderPagination(pageType);
        }
    },

    changePageSize: function(pageType, size) {
        this.pageSize[pageType] = parseInt(size);
        this.currentPage[pageType] = 1;
        if (typeof renderTable === 'function') {
            renderTable(pageType);
        }
        if (typeof renderPagination === 'function') {
            renderPagination(pageType);
        }
    }
};

// ==================== 全局事件处理函数 ====================
function goToPage(pageType, page) {
    PageManager.goToPage(pageType, page);
}

function changePageSize(pageType, size) {
    PageManager.changePageSize(pageType, size);
}

function handlePageInput(event, pageType) {
    if (event.key === 'Enter') {
        const page = parseInt(event.target.value);
        if (!isNaN(page)) {
            PageManager.goToPage(pageType, page);
        }
    }
}

function toggleAllCheckboxes(checkbox) {
    const table = checkbox.closest('table');
    const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = checkbox.checked);
}

function handleSearch(pageType) {
    console.log('搜索:', pageType);
    PageManager.currentPage[pageType] = 1;
    if (typeof renderTable === 'function') {
        renderTable(pageType);
    }
    if (typeof renderPagination === 'function') {
        renderPagination(pageType);
    }
}

function resetSearch(btn) {
    const searchPanel = btn.closest('.search-panel');
    const inputs = searchPanel.querySelectorAll('input, select');
    inputs.forEach(input => {
        if (input.tagName === 'INPUT') {
            input.value = '';
        } else if (input.tagName === 'SELECT') {
            input.selectedIndex = 0;
        }
    });
}

function handleEdit(pageType, id) {
    console.log('编辑:', pageType, id);
}

function handleDelete(pageType, id) {
    if (confirm('确定要删除这条记录吗？')) {
        const data = PageManager.data[pageType];
        const index = data.findIndex(item => item.id === id);
        if (index > -1) {
            data.splice(index, 1);
            if (typeof renderTable === 'function') {
                renderTable(pageType);
            }
            if (typeof renderPagination === 'function') {
                renderPagination(pageType);
            }
        }
    }
}

// ==================== 弹窗管理 ====================
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function confirmAdd(pageType) {
    alert('新增成功！');
    closeModal(pageType + 'AddModal');
}

// ==================== 父页面导航控制 ====================
function navigateTo(page) {
    parent.navigateTo(page);
}
