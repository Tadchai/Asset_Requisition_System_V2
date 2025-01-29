function ToManageUserPage()
{
  window.location.href = "/Frontend/ManageUser.html";
}
function ToManageAssetInSystemPage()
{
  window.location.href = "/Frontend/ManageAssetInSystem.html"
}
function ToManageAssetPage()
{
  window.location.href = "/Frontend/ManageAsset.html"
}
function ToLoginPage()
{
    localStorage.removeItem('token');
    window.location.href = "/Frontend/login.html"
}

document.addEventListener("DOMContentLoaded", async () =>
{
  try
  {
    fetchAssetData();
  } catch (error)
  {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถโหลดข้อมูลได้");
  }
});

document.getElementById("RequestReturnList").addEventListener("click", async () =>
{
  try
  {
    fetchAssetData();
  } catch (error)
  {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถโหลดข้อมูลได้");
  }
});

document.getElementById("RequestList").addEventListener("click", async () =>
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/RequestRequisition/GetRequestList`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayRequestList(data);
  } catch (error)
  {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถโหลดข้อมูลได้");
  }
});

document.getElementById("ReturnList").addEventListener("click", async () =>
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/ReturnRequisition/GetReturnList`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayReturnList(data);
  } catch (error)
  {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถโหลดข้อมูลได้");
  }
});


function displayRequestList(data)
{
  document.getElementById("multi-view").style.display = "none"
  document.getElementById("single-view").style.display = "flex"
  const container = document.getElementById("asset-container");
  container.innerHTML =
    '<div class="table-header">รายการใบคำร้องขอเบิกทั้งหมดในระบบ</div>';

  if (data.length === 0)
  {
    container.innerHTML += "<p>ไม่มีใบคำร้องขอเบิก</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
        <thead>
          <tr>
            <th>ลำดับที่</th>
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
        (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.username}</td>
              <td>${item.categoryName}</td>
              <td>${item.requirement}</td>
              <td>${item.dueDate}</td>
              <td>${item.reasonRequest}</td>
              <td>${item.status}</td>
              <td>
                ${item.status === "Pending"
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
    '<div class="table-header">รายการใบคืนทรัพย์สินทั้งหมดในระบบ</div>';

  if (data.length === 0)
  {
    container.innerHTML += "<p>ไม่มีใบคืนทรัพย์</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
        <thead>
          <tr>
            <th>ลำดับที่</th>
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
        (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.username}</td>
              <td>${item.categoryName}</td>
              <td>${item.classificationName}</td>
              <td>${item.assetId}</td>
              <td>${item.reasonReturn}</td>
              <td>${item.status}</td>
              <td>
                ${item.status === "Pending"
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

async function fetchAssetData()
{
  try
  {
    document.getElementById("multi-view").style.display = "grid"
    document.getElementById("single-view").style.display = "none"
    let token = localStorage.getItem('token');
    const [pendingData, allocatedData, returnedData] = await Promise.all([
      fetch('http://localhost:5009/RequestRequisition/GetPendingRequest', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }).then(res => res.json()),
      fetch('http://localhost:5009/RequestRequisition/GetAllocatedRequest', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }).then(res => res.json()),
      fetch('http://localhost:5009/ReturnRequisition/GetPendingReturn', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }).then(res => res.json())
    ]);

    displayRequestTable('รายการใบคำร้องขอเบิกรอดำเนินการ', pendingData, 'pending-container');
    displayRequestTable('รายการใบคำร้องขอเบิกที่ยังไม่เสร็จสมบูรณ์', allocatedData, 'allocated-container');
    displayReturnTable('รายการใบคืนทรัพย์สินรอดำเนินการ', returnedData, 'returned-container');
  } catch (error)
  {
    console.error('Error fetching asset data:', error);
    document.getElementById("pending-container").innerHTML = "<p>เกิดข้อผิดพลาดในการดึงข้อมูล</p>";
    document.getElementById("allocated-container").innerHTML = "<p>เกิดข้อผิดพลาดในการดึงข้อมูล</p>";
    document.getElementById("returned-container").innerHTML = "<p>เกิดข้อผิดพลาดในการดึงข้อมูล</p>";
  }
}

function displayRequestTable(title, data, containerId)
{
  const container = document.getElementById(containerId);
  container.innerHTML = `<div class="table-header">${title}</div>`;

  if (data.length === 0)
  {
    container.innerHTML += "<p>ไม่มีใบคำร้องขอเบิก</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
        <thead>
          <tr>
            <th>ลำดับที่</th>
            <th>ชื่อผู้ขอเบิก</th>
            <th>หมวดหมู่ของทรัพย์สิน</th>
            <th>วันที่ต้องการใช้งาน</th>
          </tr>
        </thead>
        <tbody>
          ${data
      .map(
        (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.username}</td>
              <td>${item.categoryName}</td>
              <td>${item.dueDate}</td>
            </tr>
          `
      )
      .join("")}
        </tbody>
      `;

  container.appendChild(table);
}

function displayReturnTable(title, data, containerId)
{
  const container = document.getElementById(containerId);
  container.innerHTML = `<div class="table-header">${title}</div>`;

  if (data.length === 0)
  {
    container.innerHTML += "<p>ไม่มีใบคืนทรัพย์สิน</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
        <thead>
          <tr>
            <th>ลำดับที่</th>
            <th>ชื่อผู้คืน</th>
            <th>หมวดหมู่ของทรัพย์สิน</th>
            <th>การจำแนกประเภทของทรัพย์สิน</th>
            <th>รหัสทรัพย์สิน</th>
          </tr>
        </thead>
        <tbody>
          ${data
      .map(
        (item, index) => `
            <tr>
              <td>${index + 1}</td>
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

  container.appendChild(table);
}

async function confirmAction(returnId, instanceId)
{
  const userConfirmation = confirm("คุณแน่ใจหรือไม่ว่าต้องการยืนยันการเปลี่ยนแปลงสถานะนี้?");

  if (!userConfirmation)
  {
    return;
  }
  const userData = getResultFromToken()
  let userId = parseInt(userData.nameid)

  const data = {
    ResponsibleId: userId,
    ReturnId: returnId,
    InstanceId: instanceId
  };

  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch("http://localhost:5009/ReturnRequisition/ConfirmReturn", {
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
      alert(result.message);
      refreshTableReturn();
    } else
    {
      alert(resultmessage);
    }
  } catch (error)
  {
    console.error("Error confirming request:", error);
    alert("ไม่สามารถเชื่อมต่อกับ API ได้");
  }
}

async function refreshTableReturn()
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/ReturnRequisition/GetReturnList`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error("Failed to fetch updated data");
    }
    const data = await response.json();
    displayReturnList(data);
  } catch (error)
  {
    console.error("Error refreshing table:", error);
  }
}
async function refreshTableRequest()
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/RequestRequisition/GetRequestList`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error("Failed to fetch updated data");
    }
    const data = await response.json();
    displayRequestList(data);
  } catch (error)
  {
    console.error("Error refreshing table:", error);
  }
}

async function confirmRequestAction(requestId)
{
  document.getElementById("RequestModal").style.display = "flex";

  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/RequestRequisition/GetRequestListById?requestId=${requestId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    document.getElementById("Username").textContent = data.username || "-";
    document.getElementById("CategoryName").textContent = data.categoryName || "-";
    document.getElementById("Requirement").textContent = data.requirement || "-";
    document.getElementById("DueDate").textContent = data.dueDate || "-";
    document.getElementById("ReasonRequest").textContent = data.reasonRequest || "-";
    document.getElementById("Status").textContent = data.status || "-";

    document.getElementById("submitDecisionBtn").setAttribute("data-request-id", requestId);

  } catch (error)
  {
    console.error("Error fetching Instance data:", error);
    alert("ไม่สามารถโหลดข้อมูลหมวดหมู่ได้");
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
    const response = await fetch("http://localhost:5009/Item/GetFreeInstance", {
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
  const userData = getResultFromToken()
  let userId = parseInt(userData.nameid)

  const data = {
    RequestId: requestId,
    Status: parseInt(decision),
    InstanceId: decision === "1" ? selectedAsset : null,
    ReasonRejected: decision === "2" ? rejectReason : null,
    ResponsibleId: userId
  };

  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch("http://localhost:5009/RequestRequisition/SetRequest", {
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
      alert(result.message);
      refreshTableRequest()
      RequestModal.style.display = "none";
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