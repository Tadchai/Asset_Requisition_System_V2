import { API_URL, RequestStatus } from "/Frontend/assets/config.js";

fetchListOverview()

document.getElementById("ToManageAssetPage").addEventListener("click", async () =>
{
    window.location.href = "/Frontend/ManageAsset.html"
});
document.getElementById("ToManageAssetInSystemPage").addEventListener("click", async () =>
{
    window.location.href = "/Frontend/ManageAssetInSystem.html"
});
document.getElementById("ToManageRequestReturnPage").addEventListener("click", async () =>
{
    window.location.href = "/Frontend/ManageRequestReturn.html"
});
document.getElementById("ToLoginPage").addEventListener("click", async () =>
{
    localStorage.removeItem('token');
    const logoutUrl = `http://localhost:8080/realms/Requisition/protocol/openid-connect/logout`;
    window.location.href = logoutUrl;
    window.location.href = "/Frontend/login.html"
});

document.getElementById("List").addEventListener("click", async () =>
{
    fetchListOverview()
});
document.getElementById("Pie").addEventListener("click", async () =>
{
    fetchPieChartOverview()
});

async function fetchListOverview()
{
    try
    {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/Item/GetCountInstance`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        displayListOverview(result);

    } catch (error)
    {
        console.error("Error:", error);
    }
}

async function fetchPieChartOverview()
{
    try
    {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/Item/GetCountInstance`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        renderPieCharts(result);

    } catch (error)
    {
        console.error("Error:", error);
    }
}

function displayListOverview(data) {
    const container = document.getElementById("asset-container");
    container.innerHTML = `
    <div style="display: flex; align-items: center;">
     <div style="flex-grow: 1; text-align: center;" class="table-header">รายการทรัพย์สินทั้งหมด</div>
     <div><label for="minStockInput">จัดเตรียมขั้นต่ำ: 5</label></div>
     </div>
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
      <th>จำนวนทั้งหมด</th>
      <th>จำนวนที่ถูกใช้งาน</th>
      <th>จำนวนที่ต้องจัดเตรียม</th>
    </tr>
  </thead>
  <tbody>
    ${data
            .map((item, index) => {
                let minStock = 5;
                let remaining = item.totalInstances - item.totalUsed;
                let needed = remaining < minStock ? minStock - remaining : 0;

                return `
      <tr>
        <td>${index + 1}</td>
        <td>${item.categoryName}</td>
        <td>${item.totalInstances}</td>
        <td>${item.totalUsed}</td>
        <td>${needed}</td>
      </tr>
    `;
            })
            .join("")}
  </tbody>
`;

    container.appendChild(table);
}

function renderPieCharts(data)
{
    const chartContainer = document.getElementById("asset-container");
    chartContainer.innerHTML = `<div style="text-align: center;" class="table-header">สัดส่วนการใช้งานทรัพย์สิน</ก>`;

    data.forEach((item, index) =>
    {
        const canvasId = `chart-${index}`;
        chartContainer.innerHTML += `
            <div class="chart-item">
                <h3>${item.categoryName}</h3>
                <canvas id="${canvasId}"></canvas>
            </div>
        `;

        setTimeout(() =>
        {
            const ctx = document.getElementById(canvasId).getContext("2d");
            new Chart(ctx, {
                type: "pie",
                data: {
                    labels: [`ใช้งาน (${item.totalUsed})`, `เหลือ (${item.totalInstances - item.totalUsed})`],
                    datasets: [{
                        data: [item.totalUsed, item.totalInstances - item.totalUsed],
                        backgroundColor: ["#FF6384", "#36A2EB"],
                    }]
                }
            });
        }, 100);
    });
}



