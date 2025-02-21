import {
  API_URL,
  RequestStatus,
  ReturnStatus,
} from "/Frontend/assets/config.js";
import {
  padNumber,
  loadCategories,
  loadUsersFromData,
  loadProcurersFromData,
  loadDates,
  loadName,
} from "/Frontend/assets/utils.js";

loadName();

document
  .getElementById("ToManageAssetInSystemPage")
  .addEventListener("click", async () => {
    window.location.href = "/Frontend/ManageAssetInSystem.html";
  });
document
  .getElementById("ToManageAssetPage")
  .addEventListener("click", async () => {
    window.location.href = "/Frontend/ManageAsset.html";
  });
document
  .getElementById("ToOverviewAssetPage")
  .addEventListener("click", async () => {
    window.location.href = "/Frontend/OverviewAsset.html";
  });
document
  .getElementById("ToOverviewUserPage")
  .addEventListener("click", async () => {
    window.location.href = "/Frontend/OverviewUser.html";
  });
document.getElementById("ToLoginPage").addEventListener("click", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("code_verifier");
  localStorage.removeItem("state");
  window.location.href = "/Frontend/login.html";
});

document
  .getElementById("RequestReturnList")
  .addEventListener("click", async () => {
    refreshTable(fetchGetPendingRequest);
    refreshTable(fetchGetAllocatedRequest);
    refreshTable(fetchGetPendingReturn);
  });

document.getElementById("RequestList").addEventListener("click", async () => {
  fetchGetRequestList();
});

document.getElementById("ReturnList").addEventListener("click", async () => {
  fetchGetReturnList();
});

let pageSize = 10;
let PreviousCursor = null;
let NextCursor = null;
let TotalRow = 0;

function search(fetchFunction) {
  fetchFunction(null, null);
}
function nextPage(fetchFunction) {
  fetchFunction(null, NextCursor);
}
function previousPage(fetchFunction) {
  fetchFunction(PreviousCursor, null);
}
function updatePaginationControls(fetchFunction) {
  document.getElementById("prevBtn").onclick = () =>
    previousPage(fetchFunction);
  document.getElementById("nextBtn").onclick = () => nextPage(fetchFunction);

  document.getElementById("pageSizeSelect").value = pageSize;
}
function changePageSize(newSize, fetchFunction) {
  pageSize = newSize;
  fetchFunction();
}
function updatePage(result) {
  document.getElementById("TotalRow").innerText = result.totalRow ?? 0;
  document.getElementById("TotalBefore").innerText = result.totalBefore ?? 0;
  document.getElementById("TotalAfter").innerText = result.totalAfter ?? 0;
  document.getElementById("RowCountDisplay").innerText = result.itemTotal ?? 0;
  document.getElementById("nextBtn").disabled = result.totalAfter === 0;
  document.getElementById("prevBtn").disabled = result.totalBefore === 0;
}
function showNoMoreDataMessage(loadMoreBtnId, tableId) {
  const loadMoreBtn = document.getElementById(loadMoreBtnId);
  if (loadMoreBtn) {
    loadMoreBtn.remove();
  }

  const table = document.getElementById(tableId);
  if (table) {
    const tbody = table.querySelector("tbody");
    if (tbody) {
      const noDataRow = document.createElement("tr");
      noDataRow.innerHTML = `<td colspan="6" style="text-align: center; color: red;">ไม่มีข้อมูลแล้ว</td>`;
      tbody.appendChild(noDataRow);
    }
  }
}
function updateLoadMoreButton(loadMoreBtnId, tableId, hasMore) {
  const loadMoreBtn = document.getElementById(loadMoreBtnId);

  if (!hasMore) {
    showNoMoreDataMessage(loadMoreBtnId, tableId);
    if (loadMoreBtn) {
      loadMoreBtn.style.display = "none";
    }
  } else {
    if (loadMoreBtn) {
      loadMoreBtn.style.display = "block";
    }
  }
}
function refreshTable(fetchFunction) {
  if (fetchFunction == fetchGetPendingRequest) {
    P_NextCursor = null;
    P_DayNextCursor = null;
    P_isLoading = false;
    const table = document.getElementById("pending-table");
    if (table) table.remove();
    document.getElementById("pending-container").innerHTML = "";
  } else if (fetchFunction == fetchGetAllocatedRequest) {
    A_NextCursor = null;
    A_DayNextCursor = null;
    A_isLoading = false;
    const table = document.getElementById("allocated-table");
    if (table) table.remove();
    document.getElementById("allocated-container").innerHTML = "";
  } else {
    PT_NextCursor = null;
    PT_isLoading = false;
    const table = document.getElementById("returned-table");
    if (table) table.remove();
    document.getElementById("returned-container").innerHTML = "";
  }

  fetchFunction();
}

let P_NextCursor,
  A_NextCursor,
  PT_NextCursor = null;
let P_DayNextCursor,
  A_DayNextCursor = null;
let P_PageSize = 3;
let A_PageSize = 3;
let PT_PageSize = 3;
let P_isLoading = false;
let A_isLoading = false;
let PT_isLoading = false;
let P_hasMore, A_hasMore, PT_hasMore;

async function fetchGetPendingRequest() {
  if (P_isLoading) return;
  P_isLoading = true;

  try {
    document.getElementById("footer").style.display = "none";
    document.getElementById("multi-view").style.display = "grid";
    document.getElementById("single-view").style.display = "none";

    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/RequestRequisition/GetPendingRequest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          NextCursor: P_NextCursor,
          DayNextCursor: P_DayNextCursor,
          PageSize: P_PageSize,
        }),
      }
    );

    const result = await response.json();

    P_NextCursor = result.nextCursor;
    P_DayNextCursor = result.dayNextCursor;
    P_hasMore = result.hasNextPage;

    displayPendingRequest(result.data, true);
    updateLoadMoreButton("PRloadMoreBtn", "pending-table", P_hasMore);
  } catch (error) {
    console.error("Error:", error);
  }

  P_isLoading = false;
}

async function fetchGetAllocatedRequest() {
  if (A_isLoading) return;
  A_isLoading = true;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/RequestRequisition/GetAllocatedRequest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          NextCursor: A_NextCursor,
          DayNextCursor: A_DayNextCursor,
          PageSize: A_PageSize,
        }),
      }
    );

    const result = await response.json();

    A_NextCursor = result.nextCursor;
    A_DayNextCursor = result.dayNextCursor;
    A_hasMore = result.hasNextPage;

    displayAllocatedRequest(result.data, true);
    updateLoadMoreButton("ARloadMoreBtn", "allocated-table", A_hasMore);
  } catch (error) {
    console.error("Error:", error);
  }

  A_isLoading = false;
}

async function fetchGetPendingReturn() {
  if (PT_isLoading) return;
  PT_isLoading = true;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/ReturnRequisition/GetPendingReturn`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          NextCursor: PT_NextCursor,
          PageSize: PT_PageSize,
        }),
      }
    );

    const result = await response.json();

    PT_NextCursor = result.nextCursor;
    PT_hasMore = result.hasNextPage;

    displayPendingReturn(result.data, true);
    updateLoadMoreButton("PTRloadMoreBtn", "returned-table", PT_hasMore);
  } catch (error) {
    console.error("Error:", error);
  }

  PT_isLoading = false;
}

async function fetchGetRequestList(previousCursor, nextCursor) {
  try {
    document.getElementById("footer").style.display = "flex";

    const token = localStorage.getItem("token");

    const requestBody = {
      PageSize: pageSize,
      PreviousCursor: previousCursor,
      NextCursor: nextCursor,
      requestId: document.getElementById("requestId")?.value,
      userId: document.getElementById("userId")?.value,
      categoryId: document.getElementById("categoryId")?.value,
      startDueDate: document.getElementById("startDueDate")?.value,
      endDueDate: document.getElementById("endDueDate")?.value,
      status: document.getElementById("status")?.value,
      responsibleId: document.getElementById("responsibleId")?.value,
    };

    const body = JSON.stringify(requestBody, (key, value) =>
      value === "" ? null : value
    );

    const response = await fetch(
      `${API_URL}/RequestRequisition/GetRequestList`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body,
      }
    );
    const result = await response.json();

    TotalRow = result.totalRow;
    PreviousCursor = result.previousCursor;
    NextCursor = result.nextCursor;

    displayRequestList(result.data);
    updatePaginationControls(fetchGetRequestList);
    updatePage(result);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

async function fetchGetReturnList(previousCursor, nextCursor) {
  try {
    document.getElementById("footer").style.display = "flex";

    const token = localStorage.getItem("token");

    const requestBody = {
      PageSize: pageSize,
      PreviousCursor: previousCursor,
      NextCursor: nextCursor,
      returnId: document.getElementById("returnId")?.value,
      userId: document.getElementById("userId")?.value,
      categoryId: document.getElementById("categoryId")?.value,
      status: document.getElementById("status")?.value,
      firstNameResponsible: document.getElementById("firstNameResponsible")
        ?.value,
      responsibleId: document.getElementById("responsibleId")?.value,
    };

    const body = JSON.stringify(requestBody, (key, value) =>
      value === "" ? null : value
    );

    const response = await fetch(`${API_URL}/ReturnRequisition/GetReturnList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body,
    });
    const result = await response.json();

    TotalRow = result.totalRow;
    PreviousCursor = result.previousCursor;
    NextCursor = result.nextCursor;

    displayReturnList(result.data);
    updatePaginationControls(fetchGetReturnList);
    updatePage(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

function displayPendingRequest(data, append = false) {
  const container = document.getElementById("pending-container");

  if (!append && data.length === 0) {
    container.innerHTML = `<p style="text-align: center;">ไม่มีใบขอเบิกที่รอดำเนินการ</p>`;
    return;
  }

  let table = document.getElementById("pending-table");

  if (!table) {
    table = document.createElement("table");
    table.id = "pending-table";
    table.innerHTML = `
        <thead>
          <tr>
            <th>ใบขอเบิกลำดับที่</th>
            <th>ชื่อผู้ขอเบิก</th>
            <th>หมวดหมู่ของทรัพย์สิน</th>
            <th>วันที่ต้องการใช้งาน</th>
            <th>เหลืออีก(วัน)</th> 
            <th></th> 
          </tr>
        </thead>
        <tbody></tbody>
      `;
    container.appendChild(table);
  }

  const tbody = table.querySelector("tbody");
  if (!append) {
    tbody.innerHTML = "";
  }

  data.forEach((item) => {
    const today = new Date();
    const dueDate = new Date(item.dueDate);
    const timeDiff = dueDate - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    const row = `
      <tr>
        <td>${padNumber(item.requestId, 5)}</td>
        <td>${
          item.firstName || item.lastName
            ? `${item.firstName} ${item.lastName}`
            : "-"
        }</td>
        <td>${item.categoryName}</td>
        <td>${item.dueDate}</td>
        <td>${daysLeft > 0 ? daysLeft : "ครบกำหนด"}</td>
        <td><button class="btn-confirm" onclick="confirmRequestAction(${
          item.requestId
        })">ดำเนินการ</button></td>
      </tr>
    `;

    tbody.insertAdjacentHTML("beforeend", row);
  });
  let loadMoreBtn = document.getElementById("PRloadMoreBtn");

  if (!loadMoreBtn) {
    const assetsContainer = document.createElement("div");
    assetsContainer.id = "assetsContainer";
    assetsContainer.style.textAlign = "center";

    loadMoreBtn = document.createElement("button");
    loadMoreBtn.id = "PRloadMoreBtn";
    loadMoreBtn.textContent = "Load More";
    loadMoreBtn.addEventListener("click", fetchGetPendingRequest);

    assetsContainer.appendChild(loadMoreBtn);
    container.appendChild(assetsContainer);
  }
}

function displayAllocatedRequest(data, append = false) {
  const container = document.getElementById("allocated-container");

  if (data.length === 0 && !append) {
    container.innerHTML += `<p style="text-align: center;">ไม่มีใบขอเบิกที่รอดำเนินการ</p>`;
    return;
  }

  let table = document.getElementById("allocated-table");

  if (!table) {
    table = document.createElement("table");
    table.id = "allocated-table";
    table.innerHTML = `
        <thead>
          <tr>
            <th>ใบขอเบิกลำดับที่</th>
            <th>ชื่อผู้ขอเบิก</th>
            <th>หมวดหมู่ของทรัพย์สิน</th>
            <th>วันที่ต้องการใช้งาน</th>
            <th>เหลืออีก(วัน)</th> 
          </tr>
        </thead>
        <tbody></tbody>
      `;
    container.appendChild(table);
  }

  const tbody = table.querySelector("tbody");
  if (!append) {
    tbody.innerHTML = "";
  }

  data.forEach((item) => {
    const today = new Date();
    const dueDate = new Date(item.dueDate);
    const timeDiff = dueDate - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    const row = `
      <tr>
        <td>${padNumber(item.requestId, 5)}</td>
        <td>${
          item.firstName || item.lastName
            ? `${item.firstName} ${item.lastName}`
            : "-"
        }</td>
        <td>${item.categoryName}</td>
        <td>${item.dueDate}</td>
        <td>${daysLeft > 0 ? daysLeft : "ครบกำหนด"}</td>
      </tr>
    `;

    tbody.insertAdjacentHTML("beforeend", row);
  });

  let loadMoreBtn = document.getElementById("ARloadMoreBtn");

  if (!loadMoreBtn) {
    const assetsContainer = document.createElement("div");
    assetsContainer.id = "assetsContainer";
    assetsContainer.style.textAlign = "center";

    loadMoreBtn = document.createElement("button");
    loadMoreBtn.id = "ARloadMoreBtn";
    loadMoreBtn.textContent = "Load More";
    loadMoreBtn.addEventListener("click", fetchGetAllocatedRequest);

    assetsContainer.appendChild(loadMoreBtn);
    container.appendChild(assetsContainer);
  }
}

function displayPendingReturn(data, append = false) {
  const container = document.getElementById("returned-container");

  if (data.length === 0 && !append) {
    container.innerHTML += `<p style="text-align: center;">ไม่มีใบขอเบิกที่รอดำเนินการ</p>`;
    return;
  }

  let table = document.getElementById("returned-table");

  if (!table) {
    table = document.createElement("table");
    table.id = "returned-table";
    table.innerHTML = `
            <thead>
              <tr>
                <th>ใบขอคืนลำดับที่</th>
                <th>ชื่อผู้คืน</th>
                <th>หมวดหมู่ของทรัพย์สิน</th>
                <th>การจำแนกประเภทของทรัพย์สิน</th>
                <th>รหัสทรัพย์สิน</th>
                <th></th>
              </tr>
            </thead>
            <tbody></tbody>
      `;
    container.appendChild(table);
  }

  const tbody = table.querySelector("tbody");
  if (!append) {
    tbody.innerHTML = "";
  }

  data.forEach((item) => {
    const row = `
      <tr>
        <td>${padNumber(item.returnId, 5)}</td>
        <td>${
          item.firstName || item.lastName
            ? `${item.firstName} ${item.lastName}`
            : "-"
        }</td>
        <td>${item.categoryName}</td>
        <td>${item.classificationName}</td>
        <td>${item.assetId}</td>
        <td><button class="btn-confirm" onclick="confirmAction('${
          item.returnId
        }', '${item.instanceId}')">ยืนยัน</button></td>
      </tr>
    `;

    tbody.insertAdjacentHTML("beforeend", row);
  });

  let loadMoreBtn = document.getElementById("PTRloadMoreBtn");

  if (!loadMoreBtn) {
    const assetsContainer = document.createElement("div");
    assetsContainer.id = "assetsContainer";
    assetsContainer.style.textAlign = "center";

    loadMoreBtn = document.createElement("button");
    loadMoreBtn.id = "PTRloadMoreBtn";
    loadMoreBtn.textContent = "Load More";
    loadMoreBtn.addEventListener("click", fetchGetPendingReturn);

    assetsContainer.appendChild(loadMoreBtn);
    container.appendChild(assetsContainer);
  }
}

function displayRequestList(data) {
  document.getElementById("multi-view").style.display = "none";
  document.getElementById("single-view").style.display = "flex";
  const container = document.getElementById("asset-container");

  const filters = {
    requestId: document.getElementById("requestId")?.value || "",
    userId: document.getElementById("userId")?.value || "",
    categoryId: document.getElementById("categoryId")?.value || "",
    startDueDate: document.getElementById("startDueDate")?.value || "",
    endDueDate: document.getElementById("endDueDate")?.value || "",
    status: document.getElementById("status")?.value || "",
    responsibleId: document.getElementById("responsibleId")?.value || "",
  };

  container.innerHTML = `
    <div class="table-header">
      <h2>รายการใบขอเบิกทั้งหมดในระบบ</h2>
    </div>

    <div class="table-controls">
      <span>ข้อมูลทั้งหมด: <span id="RowCountDisplay">0</span> รายการ</span>
      <div class="page-size">
        <label for="pageSizeSelect">จำนวนต่อหน้า:</label>
        <select id="pageSizeSelect" onchange="changePageSize(Number(this.value), fetchGetRequestList)">
          <option value="3">3</option>
          <option value="7">7</option>
          <option value="10" selected>10</option>
        </select>
      </div>
    </div>

    <div>
        <label for="requestId">ลำดับที่ใบขอเบิก:</label>
        <input type="number" id="requestId" name="requestId">
        <label for="categoryId">หมวดหมู่:</label>
        <select id="categoryId">
          <option value="">-</option>
        </select>
        <label for="startDueDate">ตั้งแต่วันที่:</label>
        <input type="date" id="startDueDate" name="startDueDate">
        <label for="endDueDate">ถึงวันที่:</label>
        <input type="date" id="endDueDate" name="endDueDate">
        <label for="status">สถานะ:</label>
        <select name="status" id="status">
          <option value="">-</option>
          <option value="0">Pending</option>
          <option value="1">Allocated</option>
          <option value="2">Rejected</option>
          <option value="3">Completed</option>
        </select>
        <label for="userId">ชื่อผู้ถือครอง:</label>
        <select id="userId">
          <option value="">-</option>
        </select>
        <label for="responsibleId">ชื่อผู้ดำเนินการ:</label>
        <select id="responsibleId">
          <option value="">-</option>
        </select>
        <button onclick="search(fetchGetRequestList)">ค้นหา</button>
    </div>`;
  loadCategories();
  loadUsersFromData();
  loadProcurersFromData();
  loadDates(data);

  document.getElementById("requestId").value = filters.requestId;
  document.getElementById("userId").value = filters.userId;
  document.getElementById("categoryId").value = filters.categoryId;
  document.getElementById("startDueDate").value = filters.startDueDate;
  document.getElementById("endDueDate").value = filters.endDueDate;
  document.getElementById("status").value = filters.status;
  document.getElementById("responsibleId").value = filters.responsibleId;

  if (data.length === 0) {
    container.innerHTML += `<p style="text-align: center;">ไม่มีใบขอเบิก</p>`;
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>ใบขอเบิกลำดับที่</th>
        <th>ชื่อผู้ขอเบิก</th>
        <th>หมวดหมู่ของทรัพย์สิน</th>
        <th>คุณสมบัติที่ต้องการ</th>
        <th>วันที่ต้องการใช้งาน</th>
        <th>เหตุผลในการขอเบิก</th>
        <th>สถานะคำร้อง</th>
        <th>ผู้ดำเนินการคำร้อง</th>
        <th>ดำเนินการคำร้อง</th>
      </tr>
    </thead>
    <tbody>
      ${data
        .map(
          (item) => `
        <tr>
          <td>${padNumber(item.requestId, 5)}</td>
          <td>${
            item.firstName || item.lastName
              ? `${item.firstName} ${item.lastName}`
              : "-"
          }</td>
          <td>${item.categoryName}</td>
          <td>${item.requirement}</td>
          <td>${item.dueDate}</td>
          <td>${item.reasonRequest}</td>
          <td>${RequestStatus[item.status]}</td>
          <td>${
            item.firstNameResponsible || item.lastNameResponsible
              ? `${item.firstNameResponsible} ${item.lastNameResponsible}`
              : "-"
          }</td>
          <td>
            ${
              RequestStatus[item.status] === RequestStatus[0]
                ? `<button class="btn-confirm" onclick="confirmRequestAction(${item.requestId})">ดำเนินการ</button>`
                : ""
            }
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

  container.appendChild(table);
}

function displayReturnList(data) {
  document.getElementById("multi-view").style.display = "none";
  document.getElementById("single-view").style.display = "flex";
  const container = document.getElementById("asset-container");

  const filters = {
    returnId: document.getElementById("returnId")?.value || "",
    userId: document.getElementById("userId")?.value || "",
    categoryId: document.getElementById("categoryId")?.value || "",
    status: document.getElementById("status")?.value || "",
    responsibleId: document.getElementById("responsibleId")?.value || "",
  };
  container.innerHTML = `
    <div class="table-header">
  <h2>รายการใบคืนทรัพย์สินทั้งหมดในระบบ</h2>
</div>

<div class="table-controls">
  <span>ข้อมูลทั้งหมด: <span id="RowCountDisplay">0</span> รายการ</span>
  
  <div class="page-size">
    <label for="pageSizeSelect">จำนวนต่อหน้า:</label>
    <select id="pageSizeSelect" onchange="changePageSize(Number(this.value), fetchGetReturnList)">
      <option value="3">3</option>
      <option value="7">7</option>
      <option value="10" selected>10</option>
    </select>
  </div>
</div>
    <div>
        <label for="returnId">ลำดับที่ใบขอคืน:</label>
        <input type="number" id="returnId" name="returnId">
        <label for="categoryId">หมวดหมู่:</label>
        <select id="categoryId">
          <option value="">-</option>
        </select>
        <label for="status">สถานะ:</label>
        <select name="status" id="status">
          <option value="">-</option>
          <option value="0">Pending</option>
          <option value="1">Allocated</option>
        </select>
        <label for="userId">ชื่อผู้ถือครอง:</label>
        <select id="userId">
          <option value="">-</option>
        </select>
        <label for="responsibleId">ชื่อผู้ดำเนินการ:</label>
        <select id="responsibleId">
          <option value="">-</option>
        </select>
        <button onclick="search(fetchGetReturnList)">ค้นหา</button>
    </div>
    `;
  loadCategories();
  loadUsersFromData();
  loadProcurersFromData();

  document.getElementById("returnId").value = filters.userId;
  document.getElementById("userId").value = filters.userId;
  document.getElementById("categoryId").value = filters.categoryId;
  document.getElementById("status").value = filters.status;
  document.getElementById("responsibleId").value = filters.responsibleId;

  if (data.length === 0) {
    container.innerHTML += `<p style="text-align: center;">ไม่มีใบคืนทรัพย์</p>`;
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
        <thead>
          <tr>
            <th>ใบขอคืนลำดับที่</th>
            <th>ชื่อผู้คืน</th>
            <th>หมวดหมู่ของทรัพย์สิน</th>
            <th>การจำแนกประเภทของทรัพย์สิน</th>
            <th>รหัสทรัพย์สิน</th>
            <th>เหตุผลในการคืน</th>
            <th>สถานะใบคืน</th>
            <th>ผู้ดำเนินการคำร้อง</th>
            <th>ยืนยัน</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (item) => `
            <tr>
              <td>${padNumber(item.returnId, 5)}</td>
              <td>${
                item.firstName || item.lastName
                  ? `${item.firstName} ${item.lastName}`
                  : "-"
              }</td>
              <td>${item.categoryName}</td>
              <td>${item.classificationName}</td>
              <td>${item.assetId}</td>
              <td>${item.reasonReturn}</td>
              <td>${ReturnStatus[item.status]}</td>
              <td>${
                item.firstNameResponsible || item.lastNameResponsible
                  ? `${item.firstNameResponsible} ${item.lastNameResponsible}`
                  : "-"
              }</td>
              <td>
                ${
                  ReturnStatus[item.status] === ReturnStatus[0]
                    ? `<button class="btn-confirm" onclick="confirmAction('${item.returnId}', '${item.instanceId}')">ยืนยัน</button>`
                    : ""
                }
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      `;

  container.appendChild(table);
}

async function confirmRequestAction(requestId) {
  document.getElementById("RequestModal").style.display = "flex";
  try {
    let token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/RequestRequisition/GetRequestListById?requestId=${requestId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();

    document.getElementById("Username").textContent =
      data.firstName && data.lastName
        ? `${data.firstName} ${data.lastName}`
        : "-";
    document.getElementById("CategoryName").textContent =
      data.categoryName || "-";
    document.getElementById("Requirement").textContent =
      data.requirement || "-";
    document.getElementById("DueDate").textContent = data.dueDate || "-";
    document.getElementById("ReasonRequest").textContent =
      data.reasonRequest || "-";
    document.getElementById("Status").textContent =
      RequestStatus[data.status] || "-";

    document
      .getElementById("submitDecisionBtn")
      .setAttribute("data-request-id", requestId);
  } catch (error) {
    console.error("Error fetching Instance data:", error);
  }
}
document
  .getElementById("closeRequestModalBtn")
  .addEventListener("click", () => {
    document.getElementById("Username").textContent = "-";
    document.getElementById("CategoryName").textContent = "-";
    document.getElementById("Requirement").textContent = "-";
    document.getElementById("DueDate").textContent = "-";
    document.getElementById("ReasonRequest").textContent = "-";
    document.getElementById("Status").textContent = "-";

    RequestModal.style.display = "none";
  });

async function handleDecisionChange() {
  const decisionSelect = document.getElementById("decisionSelect").value;
  const acceptOptions = document.getElementById("acceptOptions");
  const rejectReason = document.getElementById("rejectReason");

  if (decisionSelect === "1") {
    acceptOptions.style.display = "flex";
    rejectReason.style.display = "none";
    await loadAssets();
  } else if (decisionSelect === "2") {
    acceptOptions.style.display = "none";
    rejectReason.style.display = "flex";
  } else {
    acceptOptions.style.display = "none";
    rejectReason.style.display = "none";
  }
}

async function loadAssets() {
  try {
    let token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/Item/GetFreeInstance`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const assets = await response.json();

    const assetSelect = document.getElementById("assetSelectRequisition");
    assetSelect.innerHTML =
      '<option value="">-- กรุณาเลือกทรัพย์สิน --</option>';

    assets.forEach((asset) => {
      const option = document.createElement("option");
      option.value = asset.instanceId;
      option.textContent = `${asset.categoryName} - ${asset.classificationName} (${asset.assetId})`;
      assetSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading assets:", error);
    alert("ไม่สามารถดึงข้อมูลทรัพย์สินได้");
  }
}

async function submitDecision() {
  const requestId = document
    .getElementById("submitDecisionBtn")
    .getAttribute("data-request-id");
  const decision = document.getElementById("decisionSelect").value;
  const selectedAsset = document.getElementById("assetSelectRequisition").value;
  const rejectReason = document.getElementById("rejectReasonInput").value;

  const data = {
    RequestId: requestId,
    Status: parseInt(decision),
    InstanceId: decision === "1" ? selectedAsset : null,
    ReasonRejected: decision === "2" ? rejectReason : null,
  };

  try {
    let token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/RequestRequisition/SetRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (response.ok) {
      RequestModal.style.display = "none";
      fetchGetRequestList();
      alert(result.message);
    } else {
      alert(result.message || "เกิดข้อผิดพลาด");
    }
  } catch (error) {
    console.error("Error submitting decision:", error);
    alert("ไม่สามารถเชื่อมต่อกับ API ได้");
  }
}

async function confirmAction(returnId, instanceId) {
  const userConfirmation = confirm(
    "คุณแน่ใจหรือไม่ว่าต้องการยืนยันการเปลี่ยนแปลงสถานะนี้?"
  );
  if (!userConfirmation) {
    return;
  }
  const data = {
    ReturnId: returnId,
    InstanceId: instanceId,
  };

  try {
    let token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/ReturnRequisition/ConfirmReturn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (response.ok) {
      fetchGetReturnList();
      alert(result.message);
    } else {
      alert(resultmessage);
    }
  } catch (error) {
    console.error("Error confirming request:", error);
  }
}

window.changePageSize = changePageSize;
window.confirmRequestAction = confirmRequestAction;
window.handleDecisionChange = handleDecisionChange;
window.submitDecision = submitDecision;
window.confirmAction = confirmAction;
window.fetchGetReturnList = fetchGetReturnList;
window.fetchGetRequestList = fetchGetRequestList;
window.search = search;
window.nextPage = nextPage;
window.previousPage = previousPage;
window.refreshTable = refreshTable;
window.fetchGetPendingRequest = fetchGetPendingRequest;
window.fetchGetAllocatedRequest = fetchGetAllocatedRequest;
window.fetchGetPendingReturn = fetchGetPendingReturn;

refreshTable(fetchGetPendingRequest);
refreshTable(fetchGetAllocatedRequest);
refreshTable(fetchGetPendingReturn);
