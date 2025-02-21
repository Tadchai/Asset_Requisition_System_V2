import { API_URL, RequestStatus } from "/Frontend/assets/config.js";
import { loadName } from "/Frontend/assets/utils.js";

loadName();
fetchListOverview();

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

document.getElementById("List").addEventListener("click", async () => {
  fetchListOverview();
});
document.getElementById("Efficiency").addEventListener("click", async () => {
  fetchGetBackupEfficiency();
});
document.getElementById("Pie").addEventListener("click", async () => {
  fetchPieChartOverview();
});
document.getElementById("UseTime").addEventListener("click", async () => {
  fetchGetTimetoAllocate();
});
document.getElementById("Lifespan").addEventListener("click", async () => {
  fetchGetLifespan();
});

function search(fetchFunction) {
  fetchFunction();
}

async function fetchListOverview() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/Item/GetCountInstance`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    displayListOverview(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchGetBackupEfficiency() {
  try {
    const token = localStorage.getItem("token");

    const requestBody = {
      startDate: document.getElementById("startDate")?.value,
      endDate: document.getElementById("endDate")?.value,
    };

    const body = JSON.stringify(requestBody, (key, value) =>
      value === "" ? null : value
    );

    const response = await fetch(`${API_URL}/Item/GetBackupEfficiency`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body,
    });

    const result = await response.json();
    displayGetBackupEfficiency(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchPieChartOverview() {
  try {
    const token = localStorage.getItem("token");

    const requestBody = {
      startDate: document.getElementById("startDate")?.value,
      endDate: document.getElementById("endDate")?.value,
    };

    const body = JSON.stringify(requestBody, (key, value) =>
      value === "" ? null : value
    );

    const response = await fetch(`${API_URL}/Item/GetProportionOfAsset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body,
    });

    const result = await response.json();
    displayPieCharts(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchGetTimetoAllocate() {
  try {
    const token = localStorage.getItem("token");

    const requestBody = {
      startDate: document.getElementById("startDate")?.value,
      endDate: document.getElementById("endDate")?.value,
    };

    const body = JSON.stringify(requestBody, (key, value) =>
      value === "" ? null : value
    );

    const response = await fetch(`${API_URL}/Item/GetTimetoAllocate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body,
    });

    const result = await response.json();
    displayGetTimetoAllocate(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchGetLifespan() {
  try {
    const token = localStorage.getItem("token");

    const requestBody = {
      startDate: document.getElementById("startDate")?.value,
      endDate: document.getElementById("endDate")?.value,
    };

    const body = JSON.stringify(requestBody, (key, value) =>
      value === "" ? null : value
    );

    const response = await fetch(`${API_URL}/Item/GetLifespan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body,
    });

    const result = await response.json();
    displayGetLifespan(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

function displayListOverview(data) {
  const container = document.getElementById("asset-container");
  container.innerHTML = `
     <div class="table-header">ความพร้อมใช้งานของทรัพย์สินทั้งหมด</div>
  `;

  if (data.length === 0) {
    container.innerHTML += `<p style="text-align: center;">ไม่มีทรัพย์สิน</p>`;
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
  <thead>
    <tr>
      <th>ลำดับที่</th>
      <th>หมวดหมู่ของทรัพย์สิน</th>
      <th>จำนวนที่ต้องการสำรอง</th>
      <th>จำนวนทั้งหมด</th>
      <th>จำนวนที่อยู่ระห่วงการใช้งาน</th>
      <th>จำนวนที่ต้องจัดเตรียมเพิ่ม</th>
    </tr>
  </thead>
  <tbody>
    ${data
      .map((item, index) => {
        let remaining = item.totalInstances - item.totalInUsed;
        let needed =
          remaining < item.reservedQuantity
            ? item.reservedQuantity - remaining
            : 0;

        return `
      <tr>
        <td>${index + 1}</td>
        <td>${item.categoryName}</td>
        <td>${item.reservedQuantity}</td>
        <td>${item.totalInstances}</td>
        <td>${item.totalInUsed}</td>
        <td>${needed}</td>
      </tr>
    `;
      })
      .join("")}
  </tbody>
`;

  container.appendChild(table);
}

function displayGetBackupEfficiency(data) {
  const container = document.getElementById("asset-container");

  const filters = {
    startDate: document.getElementById("startDate")?.value || "",
    endDate: document.getElementById("endDate")?.value || "",
  };

  container.innerHTML = `
       <div class="table-header">ประสิทธิภาพการสำรองทรัพย์สิน</div>
       <div>
        <label for="startDate">ตั้งแต่วันที่:</label>
        <input type="date" id="startDate" name="startDate">
        <label for="endDate">ถึงวันที่:</label>
        <input type="date" id="endDate" name="endDate">
        <button onclick="search(fetchGetBackupEfficiency)">ค้นหา</button>
    </div>
    `;

  document.getElementById("startDate").value = filters.startDate;
  document.getElementById("endDate").value = filters.endDate;

  if (data.length === 0) {
    container.innerHTML += `<p style="text-align: center;">ไม่มีทรัพย์สิน</p>`;
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>ลำดับที่</th>
        <th>หมวดหมู่ของทรัพย์สิน</th>
        <th>ระยะเวลาเฉลี่ยก่อนถูกใช้งาน(วัน)</th>
      </tr>
    </thead>
    <tbody>
      ${data
        .map(
          (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.categoryName}</td>
          <td>${item.averageEfficiency.toFixed(2)}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

  container.appendChild(table);
}

function displayPieCharts(data) {
  const chartContainer = document.getElementById("asset-container");

  const filters = {
    startDate: document.getElementById("startDate")?.value || "",
    endDate: document.getElementById("endDate")?.value || "",
  };

  chartContainer.innerHTML = `
  <div class="table-header">สัดส่วนการใช้งานทรัพย์สิน</div>
  <div>
        <label for="startDate">ตั้งแต่วันที่:</label>
        <input type="date" id="startDate" name="startDate">
        <label for="endDate">ถึงวันที่:</label>
        <input type="date" id="endDate" name="endDate">
        <button onclick="search(fetchPieChartOverview)">ค้นหา</button>
    </div>
  `;

  document.getElementById("startDate").value = filters.startDate;
  document.getElementById("endDate").value = filters.endDate;

  data.forEach((item, index) => {
    const canvasId = `chart-${index}`;
    chartContainer.innerHTML += `
            <div class="chart-item">
                <h3>${item.categoryName}</h3>
                <canvas id="${canvasId}"></canvas>
            </div>
        `;

    setTimeout(() => {
      const ctx = document.getElementById(canvasId).getContext("2d");
      new Chart(ctx, {
        type: "pie",
        data: {
          labels: [
            `จำนวนที่สำรอง (${item.reservedCount})`,
            `จำนวนที่เกินสำรอง (${item.overReservedCount})`,
            `จำนวนที่ใช้งาน (${item.totalInUsed})`,
          ],
          datasets: [
            {
              data: [
                item.reservedCount,
                item.overReservedCount,
                item.totalInUsed,
              ],
              backgroundColor: ["#FF6384", "#36A2EB", "#FFFF00"],
            },
          ],
        },
      });
    }, 100);
  });
}

function displayGetTimetoAllocate(data) {
  const container = document.getElementById("asset-container");

  const filters = {
    startDate: document.getElementById("startDate")?.value || "",
    endDate: document.getElementById("endDate")?.value || "",
  };

  container.innerHTML = `
       <div class="table-header">ระยะเวลาในการจัดสรรทรัพย์สินโดยเฉลี่ย</div>
       <label for="startDate">ตั้งแต่วันที่:</label>
        <input type="date" id="startDate" name="startDate">
        <label for="endDate">ถึงวันที่:</label>
        <input type="date" id="endDate" name="endDate">
        <button onclick="search(fetchGetTimetoAllocate)">ค้นหา</button>
    `;

  document.getElementById("startDate").value = filters.startDate;
  document.getElementById("endDate").value = filters.endDate;

  if (data.length === 0) {
    container.innerHTML += `<p style="text-align: center;">ไม่มีทรัพย์สิน</p>`;
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
        <tr>
            <th rowspan="2">ลำดับที่</th>
            <th rowspan="2">หมวดหมู่ของทรัพย์สิน</th>
            <th colspan="2">สถิติการจัดสรร</th>
        </tr>
        <tr>
            <th>เวลาการจัดสรรเฉลี่ย</th>
            <th>เฉลี่ยส่วนต่างจากวันที่ต้องการใช้งาน</th>
        </tr>
    </thead>
    <tbody>
      ${data
        .map(
          (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.categoryName}</td>
          <td>
          ${
            item.averageLateDays < 0
              ? "ล่วงหน้า"
              : item.averageLateDays > 0
              ? "ล่าช้า"
              : "ตรงเวลา"
          }</td>
          <td>${Math.abs(item.averageLateDays.toFixed(2))}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

  container.appendChild(table);
}

function displayGetLifespan(data) {
  const container = document.getElementById("asset-container");

  const filters = {
    startDate: document.getElementById("startDate")?.value || "",
    endDate: document.getElementById("endDate")?.value || "",
  };

  container.innerHTML = `
       <div class="table-header">อายุการใช้งานทรัพย์สินโดยเฉลี่ย</div>
       <label for="startDate">ตั้งแต่วันที่:</label>
        <input type="date" id="startDate" name="startDate">
        <label for="endDate">ถึงวันที่:</label>
        <input type="date" id="endDate" name="endDate">
        <button onclick="search(fetchGetLifespan)">ค้นหา</button>
    `;

  document.getElementById("startDate").value = filters.startDate;
  document.getElementById("endDate").value = filters.endDate;

  if (data.length === 0) {
    container.innerHTML += `<p style="text-align: center;">ไม่มีทรัพย์สิน</p>`;
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>ลำดับที่</th>
        <th>หมวดหมู่ของทรัพย์สิน</th>
        <th>อายุโดยเฉลี่ย(วัน)</th>
      </tr>
    </thead>
    <tbody>
      ${data
        .map(
          (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.categoryName}</td>
          <td>${item.averageLifespan.toFixed(2)}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

  container.appendChild(table);
}

window.search = search;
window.fetchGetBackupEfficiency = fetchGetBackupEfficiency;
window.fetchGetLifespan = fetchGetLifespan;
window.fetchGetTimetoAllocate = fetchGetTimetoAllocate;
window.fetchPieChartOverview = fetchPieChartOverview;
