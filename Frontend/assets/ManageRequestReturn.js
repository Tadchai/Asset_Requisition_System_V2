import { API_URL, RequestStatus, ReturnStatus } from "/Frontend/assets/config.js";

document.getElementById("ToManageAssetInSystemPage").addEventListener("click", async () =>
{
  window.location.href = "/Frontend/ManageAssetInSystem.html"
});
document.getElementById("ToManageAssetPage").addEventListener("click", async () =>
{
  window.location.href = "/Frontend/ManageAsset.html"
});
document.getElementById("ToLoginPage").addEventListener("click", async () =>
{
  localStorage.removeItem('token');
  window.location.href = "/Frontend/login.html"
});

document.addEventListener("DOMContentLoaded", async () =>
{
  fetchGetPendingRequest();
  fetchGetAllocatedRequest();
  fetchGetPendingReturn()
});
document.getElementById("RequestReturnList").addEventListener("click", async () =>
{
  fetchGetPendingRequest();
  fetchGetAllocatedRequest();
  fetchGetPendingReturn()
});

document.getElementById("RequestList").addEventListener("click", async () =>
{
  fetchGetRequestList()
});

document.getElementById("ReturnList").addEventListener("click", async () =>
{
  fetchGetReturnList()
});

function padNumber(id, length) {
  return id.toString().padStart(length, '0');
}

let currentPage = 1;
let pageSize = 10;
let RowCount = 0;

function changePage(offset, fetchFunction)
{
  currentPage += offset;
  fetchFunction();
}
function changePageSize(newSize, fetchFunction)
{
  pageSize = newSize;
  currentPage = 1;
  fetchFunction();
}
function updatePaginationControls(fetchFunction)
{
  const totalPages = Math.ceil(RowCount / pageSize);
  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled = currentPage >= totalPages;

  document.getElementById("prevBtn").onclick = () => changePage(-1, fetchFunction);
  document.getElementById("nextBtn").onclick = () => changePage(1, fetchFunction);

  document.getElementById("pageSizeSelect").value = pageSize;
}
function updateTotalItemsDisplay()
{
  document.getElementById("RowCountDisplay").innerText = `มีข้อมูลทั้งหมด ${RowCount} รายการ`;
}


let PRcurrentPageLoad = 1, PRpageSizeLoad = 3, PRRowCount = 0;
let ARcurrentPageLoad = 1, ARpageSizeLoad = 3, ARRowCount = 0;
let PRTcurrentPageLoad = 1, PRTpageSizeLoad = 9, PRTRowCount = 0;

function PRloadMore(fetchFunction)
{
  PRpageSizeLoad += 5;
  fetchFunction();
}
function ARloadMore(fetchFunction)
{
  ARpageSizeLoad += 5;
  fetchFunction();
}
function PRTloadMore(fetchFunction)
{
  PRTpageSizeLoad += 9;
  fetchFunction();
}
function PRupdateLoadMoreButton(fetchFunction)
{
  const totalPages = Math.ceil(PRRowCount / PRpageSizeLoad);
  const loadMoreBtn = document.getElementById("PRloadMoreBtn");
  loadMoreBtn.onclick = () => PRloadMore(fetchFunction);

  if (PRcurrentPageLoad >= totalPages)
  {
    loadMoreBtn.style.display = "none";
  } else
  {
    loadMoreBtn.style.display = "block";
  }
}
function ARupdateLoadMoreButton(fetchFunction)
{
  const totalPages = Math.ceil(ARRowCount / ARpageSizeLoad);
  const loadMoreBtn = document.getElementById("ARloadMoreBtn");
  loadMoreBtn.onclick = () => ARloadMore(fetchFunction);

  if (ARcurrentPageLoad >= totalPages)
  {
    loadMoreBtn.style.display = "none";
  } else
  {
    loadMoreBtn.style.display = "block";
  }
}
function PRTupdateLoadMoreButton(fetchFunction)
{
  const totalPages = Math.ceil(PRTRowCount / PRTpageSizeLoad);
  const loadMoreBtn = document.getElementById("PRTloadMoreBtn");
  loadMoreBtn.onclick = () => PRTloadMore(fetchFunction);

  if (PRTcurrentPageLoad >= totalPages)
  {
    loadMoreBtn.style.display = "none";
  } else
  {
    loadMoreBtn.style.display = "block";
  }
}


async function fetchGetPendingRequest()
{
  try
  {
    document.getElementById("footer").style.display = "none"
    document.getElementById("multi-view").style.display = "grid"
    document.getElementById("single-view").style.display = "none"

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/RequestRequisition/GetPendingRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        Page: PRcurrentPageLoad,
        PageSize: PRpageSizeLoad
      }),
    });

    const result = await response.json();
    PRRowCount = result.rowCount;
    displayPendingRequest(result.data);
    PRupdateLoadMoreButton(fetchGetPendingRequest)

  } catch (error)
  {
    console.error("Error:", error);
  }
}

async function fetchGetAllocatedRequest()
{
  try
  {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/RequestRequisition/GetAllocatedRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        Page: ARcurrentPageLoad,
        PageSize: ARpageSizeLoad
      }),
    });

    const result = await response.json();
    ARRowCount = result.rowCount;
    displayAllocatedRequest(result.data);
    ARupdateLoadMoreButton(fetchGetAllocatedRequest)

  } catch (error)
  {
    console.error("Error:", error);
  }
}

async function fetchGetPendingReturn()
{
  try
  {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/ReturnRequisition/GetPendingReturn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        Page: PRTcurrentPageLoad,
        PageSize: PRTpageSizeLoad
      }),
    });

    const result = await response.json();
    PRTRowCount = result.rowCount;
    displayPendingReturn(result.data);
    PRTupdateLoadMoreButton(fetchGetPendingReturn)

  } catch (error)
  {
    console.error("Error:", error);
  }
}

async function fetchGetRequestList()
{
  try
  {
    document.getElementById("footer").style.display = "flex"
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/RequestRequisition/GetRequestList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        Page: currentPage,
        PageSize: pageSize
      }),
    });

    const result = await response.json();
    RowCount = result.rowCount;
    displayRequestList(result.data);
    updatePaginationControls(fetchGetRequestList);
    updateTotalItemsDisplay()

  } catch (error)
  {
    console.error("Error:", error);
  }
}

async function fetchGetReturnList()
{
  try
  {
    document.getElementById("footer").style.display = "flex"
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/ReturnRequisition/GetReturnList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        Page: currentPage,
        PageSize: pageSize
      }),
    });

    const result = await response.json();
    RowCount = result.rowCount;
    displayReturnList(result.data);
    updatePaginationControls(fetchGetReturnList);
    updateTotalItemsDisplay()

  } catch (error)
  {
    console.error("Error:", error);
  }
}


function displayPendingRequest(data) {
  const container = document.getElementById('pending-container');
  container.innerHTML = `<div class="table-header">รายการใบขอเบิกรอดำเนินการ</div>`;

  if (data.length === 0) {
    container.innerHTML += `<p style="text-align: center;">ไม่มีใบขอเบิกที่รอดำเนินการ</p>`;
    return;
  }

  const table = document.createElement("table");
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
        <tbody>
          ${data
      .map((item) => {
        const today = new Date(); 
        const dueDate = new Date(item.dueDate); 
        const timeDiff = dueDate - today; 
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); 
        
        return `
          <tr>
            <td>${padNumber(item.requestId,5)}</td>
            <td>${item.username}</td>
            <td>${item.categoryName}</td>
            <td>${item.dueDate}</td>
            <td>${daysLeft > 0 ? daysLeft : "ครบกำหนด"}</td>
          </tr>
        `;
      })
      .join("")}
        </tbody>
      `;

  const assetsContainer = document.createElement("div");
  assetsContainer.id = "assetsContainer";
  assetsContainer.style.textAlign = "center";
  assetsContainer.innerHTML = `<button id="PRloadMoreBtn">Load More</button>`;

  container.appendChild(table);
  container.appendChild(assetsContainer); 
}

function displayAllocatedRequest(data)
{
  const container = document.getElementById("allocated-container");
  container.innerHTML = `<div class="table-header">รายการใบขอเบิกที่ยังไม่สมบูรณ์</div>`;

  if (data.length === 0)
  {
    container.innerHTML += `<p style="text-align: center;">ไม่มีใบขอเบิกที่ยังไม่สมบูรณ์</p>`;
    return;
  }

  const table = document.createElement("table");
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
        <tbody>
          ${data
      .map((item) =>{ 
        const today = new Date(); 
        const dueDate = new Date(item.dueDate); 
        const timeDiff = dueDate - today; 
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); 
        return`
        <tr>
              <td>${padNumber(item.requestId,5)}</td>
              <td>${item.username}</td>
              <td>${item.categoryName}</td>
              <td>${item.dueDate}</td>
              <td>${daysLeft > 0 ? daysLeft : "ครบกำหนด"}</td>
            </tr>
          `
          })
      .join("")}
        </tbody>
      `;

      const assetsContainer = document.createElement("div");
      assetsContainer.id = "assetsContainer";
      assetsContainer.style.textAlign = "center";
      assetsContainer.innerHTML = `<button id="ARloadMoreBtn">Load More</button>`;
    
      container.appendChild(table);
      container.appendChild(assetsContainer);
}

function displayPendingReturn(data)
{
  const container = document.getElementById("returned-container");
  container.innerHTML = `<div class="table-header">รายการใบคืนทรัพย์สินรอดำเนินการ</div>`;

  if (data.length === 0)
  {
    container.innerHTML += `<p style="text-align: center;">ไม่มีใบคืนทรัพย์สิน</p>`;
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
              </tr>
            </thead>
            <tbody>
              ${data
      .map(
        (item) => `
                <tr>
                  <td>${padNumber(item.returnId,5)}</td>
                  <td>${item.username}</td>
                  <td>${item.categoryName}</td>
                  <td>${item.classificationName}</td>
                  <td>${item.assetId}</td>
                </tr>
              `
      )
      .join("")}
            </tbody>
          `;

          const assetsContainer = document.createElement("div");
          assetsContainer.id = "assetsContainer";
          assetsContainer.style.textAlign = "center";
          assetsContainer.innerHTML = `<button id="PRTloadMoreBtn">Load More</button>`;
        
          container.appendChild(table);
          container.appendChild(assetsContainer);
}

function displayRequestList(data)
{
  document.getElementById("multi-view").style.display = "none"
  document.getElementById("single-view").style.display = "flex"
  const container = document.getElementById("asset-container");
  container.innerHTML =
    `<label for="pageSizeSelect">จำนวนต่อหน้า:</label>
  <select id="pageSizeSelect" onchange="changePageSize(Number(this.value), fetchGetRequestList)">
    <option value="3">3</option>
    <option value="7">7</option>
    <option value="10" selected>10</option>
  </select>
    <div class="table-header">รายการใบขอเบิกทั้งหมดในระบบ</div>`;

  if (data.length === 0)
  {
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
            <th>แก้ไขสถานะ</th>
          </tr>
        </thead>
        <tbody>
          ${data
      .map(
        (item) => `
            <tr>
              <td>${padNumber(item.requestId,5)}</td>
              <td>${item.username}</td>
              <td>${item.categoryName}</td>
              <td>${item.requirement}</td>
              <td>${item.dueDate}</td>
              <td>${item.reasonRequest}</td>
              <td>${RequestStatus[item.status]}</td>
              <td>
                ${RequestStatus[item.status] === RequestStatus[0]
            ? `<button class="btn-confirm" onclick="confirmRequestAction(${item.requestId})">แก้ไข</button>`
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

function displayReturnList(data)
{
  document.getElementById("multi-view").style.display = "none"
  document.getElementById("single-view").style.display = "flex"
  const container = document.getElementById("asset-container");
  container.innerHTML =
    `<label for="pageSizeSelect">จำนวนต่อหน้า:</label>
  <select id="pageSizeSelect" onchange="changePageSize(Number(this.value), fetchGetReturnList)">
    <option value="3">3</option>
    <option value="7">7</option>
    <option value="10" selected>10</option>
  </select>
    <div class="table-header">รายการใบคืนทรัพย์สินทั้งหมดในระบบ</div>`;

  if (data.length === 0)
  {
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
            <th>ยืนยัน</th>
          </tr>
        </thead>
        <tbody>
          ${data
      .map(
        (item) => `
            <tr>
              <td>${padNumber(item.returnId,5)}</td>
              <td>${item.username}</td>
              <td>${item.categoryName}</td>
              <td>${item.classificationName}</td>
              <td>${item.assetId}</td>
              <td>${item.reasonReturn}</td>
              <td>${ReturnStatus[item.status]}</td>
              <td>
                ${ReturnStatus[item.status] === ReturnStatus[0]
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


async function confirmRequestAction(requestId)
{
  document.getElementById("RequestModal").style.display = "flex";
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/RequestRequisition/GetRequestListById?requestId=${requestId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    const data = await response.json();

    document.getElementById("Username").textContent = data.username || "-";
    document.getElementById("CategoryName").textContent = data.categoryName || "-";
    document.getElementById("Requirement").textContent = data.requirement || "-";
    document.getElementById("DueDate").textContent = data.dueDate || "-";
    document.getElementById("ReasonRequest").textContent = data.reasonRequest || "-";
    document.getElementById("Status").textContent = RequestStatus[data.status]|| "-";

    document.getElementById("submitDecisionBtn").setAttribute("data-request-id", requestId);

  } catch (error)
  {
    console.error("Error fetching Instance data:", error);
  }
}
document.getElementById("closeRequestModalBtn").addEventListener("click", () =>
{
  document.getElementById("Username").textContent = "-";
  document.getElementById("CategoryName").textContent = "-";
  document.getElementById("Requirement").textContent = "-";
  document.getElementById("DueDate").textContent = "-";
  document.getElementById("ReasonRequest").textContent = "-";
  document.getElementById("Status").textContent = "-";

  RequestModal.style.display = "none";
});

async function handleDecisionChange()
{
  const decisionSelect = document.getElementById("decisionSelect").value;
  const acceptOptions = document.getElementById("acceptOptions");
  const rejectReason = document.getElementById("rejectReason");

  if (decisionSelect === "1")
  {
    acceptOptions.style.display = "flex";
    rejectReason.style.display = "none";
    await loadAssets();
  } else if (decisionSelect === "2")
  {
    acceptOptions.style.display = "none";
    rejectReason.style.display = "flex";
  } else
  {
    acceptOptions.style.display = "none";
    rejectReason.style.display = "none";
  }
}

async function loadAssets()
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/Item/GetFreeInstance`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    const assets = await response.json();

    const assetSelect = document.getElementById("assetSelectRequisition");
    assetSelect.innerHTML = '<option value="">-- กรุณาเลือกทรัพย์สิน --</option>';

    assets.forEach((asset) =>
    {
      const option = document.createElement("option");
      option.value = asset.instanceId;
      option.textContent = `${asset.categoryName} - ${asset.classificationName} (${asset.assetId})`;
      assetSelect.appendChild(option);
    });
  } catch (error)
  {
    console.error("Error loading assets:", error);
    alert("ไม่สามารถดึงข้อมูลทรัพย์สินได้");
  }
}

async function submitDecision()
{
  const requestId = document.getElementById("submitDecisionBtn").getAttribute("data-request-id");
  const decision = document.getElementById("decisionSelect").value;
  const selectedAsset = document.getElementById("assetSelectRequisition").value;
  const rejectReason = document.getElementById("rejectReasonInput").value;

  const data = {
    RequestId: requestId,
    Status: parseInt(decision),
    InstanceId: decision === "1" ? selectedAsset : null,
    ReasonRejected: decision === "2" ? rejectReason : null
  };

  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/RequestRequisition/SetRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (response.ok)
    {
      RequestModal.style.display = "none";
      fetchGetRequestList()
      alert(result.message);
    } else
    {
      alert(result.message || "เกิดข้อผิดพลาด");
    }
  } catch (error)
  {
    console.error("Error submitting decision:", error);
    alert("ไม่สามารถเชื่อมต่อกับ API ได้");
  }
}


async function confirmAction(returnId, instanceId)
{
  const userConfirmation = confirm("คุณแน่ใจหรือไม่ว่าต้องการยืนยันการเปลี่ยนแปลงสถานะนี้?");
  if (!userConfirmation)
  {
    return;
  }
  const data = {
    ReturnId: returnId,
    InstanceId: instanceId
  };

  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ReturnRequisition/ConfirmReturn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (response.ok)
    {
      fetchGetReturnList()
      alert(result.message);
    } else
    {
      alert(resultmessage);
    }
  } catch (error)
  {
    console.error("Error confirming request:", error);
  }
}


window.confirmRequestAction = confirmRequestAction;
window.handleDecisionChange = handleDecisionChange; submitDecision
window.submitDecision = submitDecision;
window.confirmAction = confirmAction;
window.changePage = changePage;
window.changePageSize = changePageSize;
window.fetchGetReturnList = fetchGetReturnList;
window.fetchGetRequestList = fetchGetRequestList;