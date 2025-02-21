import { API_URL, RequestStatus } from "/Frontend/assets/config.js";
import {
  loadUsersFromData,
  loadProcurersFromData,
  loadName,
} from "/Frontend/assets/utils.js";

loadName();
fetchUserRequestCount();

document
  .getElementById("ToManageAssetPage")
  .addEventListener("click", async () => {
    window.location.href = "/Frontend/ManageAsset.html";
  });
document
  .getElementById("ToManageAssetInSystemPage")
  .addEventListener("click", async () => {
    window.location.href = "/Frontend/ManageAssetInSystem.html";
  });
document
  .getElementById("ToManageRequestReturnPage")
  .addEventListener("click", async () => {
    window.location.href = "/Frontend/ManageRequestReturn.html";
  });
document
  .getElementById("ToOverviewAssetPage")
  .addEventListener("click", async () => {
    window.location.href = "/Frontend/OverviewAsset.html";
  });
document.getElementById("ToLoginPage").addEventListener("click", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("code_verifier");
  localStorage.removeItem("state");
  window.location.href = "/Frontend/login.html";
});

document.getElementById("RequestCount").addEventListener("click", async () => {
  fetchUserRequestCount();
});
document
  .getElementById("ResponsibleCount")
  .addEventListener("click", async () => {
    fetchResponsibleRequestCount();
  });

function search(fetchFunction) {
  fetchFunction();
}

async function fetchUserRequestCount() {
  try {
    const token = localStorage.getItem("token");

    const requestBody = {
      startDate: document.getElementById("startDate")?.value,
      endDate: document.getElementById("endDate")?.value,
      userId: document.getElementById("userId")?.value,
    };

    const body = JSON.stringify(requestBody, (key, value) =>
      value === "" ? null : value
    );

    const response = await fetch(`${API_URL}/User/GetUserRequestCount`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body,
    });

    const result = await response.json();
    displayUserRequestCount(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchResponsibleRequestCount() {
  try {
    const token = localStorage.getItem("token");

    const requestBody = {
      startDate: document.getElementById("startDate")?.value,
      endDate: document.getElementById("endDate")?.value,
      userId: document.getElementById("responsibleId")?.value,
    };

    const body = JSON.stringify(requestBody, (key, value) =>
      value === "" ? null : value
    );

    const response = await fetch(`${API_URL}/User/GetResponsibleRequestCount`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body,
    });

    const result = await response.json();
    displayResponsibleRequestCount(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

function displayUserRequestCount(data) {
  const container = document.getElementById("asset-container");

  const filters = {
    startDate: document.getElementById("startDate")?.value || "",
    endDate: document.getElementById("endDate")?.value || "",
    userId: document.getElementById("userId")?.value || "",
  };

  container.innerHTML = `
       <div class="table-header">จำนวนการส่งใบขอเบิกของผู้ใช้งานทั้งหมดในระบบ</div>
       <div>
        <label for="startDate">ตั้งแต่วันที่:</label>
        <input type="date" id="startDate" name="startDate">
        <label for="endDate">ถึงวันที่:</label>
        <input type="date" id="endDate" name="endDate">
        <label for="userId">ชื่อผู้ใช้งาน:</label>
        <select id="userId">
          <option value="">-</option>
        </select>
        <button onclick="search(fetchUserRequestCount)">ค้นหา</button>
    </div>
    `;
  loadUsersFromData();

  document.getElementById("startDate").value = filters.startDate;
  document.getElementById("endDate").value = filters.endDate;
  document.getElementById("userId").value = filters.userId;

  if (data.length === 0) {
    container.innerHTML += `<p style="text-align: center;">ไม่มีทรัพย์สิน</p>`;
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th rowspan="2">ลำดับที่</th>
        <th rowspan="2">ชื่อผู้ใช้งาน</th>
        <th rowspan="2">จำนวนที่รอดำเนินการ</th>
        <th colspan="3">จำนวนที่ดำเนินการเรียบร้อย</th>
        <th rowspan="2">จำนวนการขอเบิกทั้งหมด</th>
      </tr>
      <tr>
        <th>จำนวนที่จัดสรรเรียบร้อย</th>
        <th>จำนวนที่ถูกปฎิเสธคำขอ</th>
        <th>จำนวนที่คำขอที่สมบูรณ์</th>
      </tr>
    </thead>
    <tbody>
      ${data
        .map(
          (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.firstName} ${item.lastName}</td>
          <td>${item.totalPending}</td>
          <td>${item.totalAllocated}</td>
          <td>${item.totalReject}</td>
          <td>${item.totalCompleted}</td>
          <td>${item.totalRequest}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

  container.appendChild(table);
}

function displayResponsibleRequestCount(data) {
  const container = document.getElementById("asset-container");

  const filters = {
    startDate: document.getElementById("startDate")?.value || "",
    endDate: document.getElementById("endDate")?.value || "",
    responsibleId: document.getElementById("responsibleId")?.value || "",
  };

  container.innerHTML = `
       <div class="table-header">จำนวนการจัดสรรของทีมจัดซื้อทั้งหมดในระบบ</div>
       <div>
        <label for="startDate">ตั้งแต่วันที่:</label>
        <input type="date" id="startDate" name="startDate">
        <label for="endDate">ถึงวันที่:</label>
        <input type="date" id="endDate" name="endDate">
        <label for="responsibleId">ชื่อผู้ใช้งาน:</label>
        <select id="responsibleId">
          <option value="">-</option>
        </select>
        <button onclick="search(fetchResponsibleRequestCount)">ค้นหา</button>
    </div>
    `;
  loadProcurersFromData();

  document.getElementById("startDate").value = filters.startDate;
  document.getElementById("endDate").value = filters.endDate;
  document.getElementById("responsibleId").value = filters.responsibleId;

  if (data.length === 0) {
    container.innerHTML += `<p style="text-align: center;">ไม่มีทรัพย์สิน</p>`;
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th rowspan="2">ลำดับที่</th>
        <th rowspan="2">ชื่อผู้ใช้งาน</th>
        <th colspan="2">จัดสรรใบขอเบิก</th>
        <th colspan="2">จัดสรรใบคืน</th>
      </tr>
      <tr>
        <th>จำนวนการจัดสรรใบขอเบิก</th>
        <th>จำนวนการปฎิเสธใบขอเบิก</th>
        <th>จำนวนการตอบรับใบคืน</th>
      </tr>
    </thead>
    <tbody>
      ${data
        .map(
          (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.firstName} ${item.lastName}</td>
          <td>${item.totalRequest}</td>
          <td>${item.totalReject}</td>
          <td>${item.totalReturn}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

  container.appendChild(table);
}

window.search = search;
window.fetchUserRequestCount = fetchUserRequestCount;
window.fetchResponsibleRequestCount = fetchResponsibleRequestCount;
