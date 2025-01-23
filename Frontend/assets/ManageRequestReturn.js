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
  const url = `http://localhost:5009/RequestRequisition/GetRequestList`;

  try
  {
    const response = await fetch(url);
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
  const url = `http://localhost:5009/ReturnRequisition/GetReturnList`;

  try
  {
    const response = await fetch(url);
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
    '<div class="table-header">รายการใบขอเบิกทั้งหมดในระบบ</div>';

  if (data.length === 0)
  {
    container.innerHTML += "<p>ไม่มีข้อมูลทรัพย์สินที่ถืออยู่</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
        <thead>
          <tr>
            <th>ลำดับที่</th>
            <th>Username</th>
            <th>CategoryName</th>
            <th>Requirement</th>
            <th>DueDate</th>
            <th>ReasonRequest</th>
            <th>Status</th>
            <th>แก้ไขStatus</th>
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
    '<div class="table-header">รายการใบคืนทั้งหมดในระบบ</div>';

  if (data.length === 0)
  {
    container.innerHTML += "<p>ไม่มีข้อมูลทรัพย์สินที่ถืออยู่</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
        <thead>
          <tr>
            <th>ลำดับที่</th>
            <th>Username</th>
            <th>CategoryName</th>
            <th>ClassificationName</th>
            <th>AssetId</th>
            <th>ReasonReturn</th>
            <th>Status</th>
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

// ฟังก์ชันดึงข้อมูลจาก API
async function fetchAssetData()
{
  try
  {
    document.getElementById("multi-view").style.display = "grid"
    document.getElementById("single-view").style.display = "none"
    // ดึงข้อมูลจากทั้ง 3 API พร้อมกัน
    const [pendingData, allocatedData, returnedData] = await Promise.all([
      fetch('http://localhost:5009/RequestRequisition/GetPendingRequest').then(res => res.json()),
      fetch('http://localhost:5009/RequestRequisition/GetAllocatedRequest').then(res => res.json()),
      fetch('http://localhost:5009/ReturnRequisition/GetPendingReturn').then(res => res.json())
    ]);

    // แสดงผลข้อมูลแต่ละตาราง
    displayRequestTable('Pending Requests', pendingData, 'pending-container');
    displayRequestTable('Allocated Assets', allocatedData, 'allocated-container');
    displayReturnTable('Returned Assets', returnedData, 'returned-container');
  } catch (error)
  {
    console.error('Error fetching asset data:', error);
    document.getElementById("pending-container").innerHTML = "<p>เกิดข้อผิดพลาดในการดึงข้อมูล</p>";
    document.getElementById("allocated-container").innerHTML = "<p>เกิดข้อผิดพลาดในการดึงข้อมูล</p>";
    document.getElementById("returned-container").innerHTML = "<p>เกิดข้อผิดพลาดในการดึงข้อมูล</p>";
  }
}

// ฟังก์ชันแสดงข้อมูลในรูปแบบตาราง
function displayRequestTable(title, data, containerId)
{
  const container = document.getElementById(containerId);
  container.innerHTML = `<div class="table-header">${title}</div>`;

  if (data.length === 0)
  {
    container.innerHTML += "<p>ไม่มีข้อมูล</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
        <thead>
          <tr>
            <th>ลำดับที่</th>
            <th>Username</th>
            <th>CategoryName</th>
            <th>DueDate</th>
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
    container.innerHTML += "<p>ไม่มีข้อมูล</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
        <thead>
          <tr>
            <th>ลำดับที่</th>
            <th>Username</th>
            <th>CategoryName</th>
            <th>ClassificationName</th>
            <th>AssetId</th>
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
  const userConfirmation = confirm("คุณแน่ใจหรือไม่ว่าต้องการยืนยันการดำเนินการนี้?");

  if (!userConfirmation)
  {
    return;
  }

  console.log(returnId);
  console.log(instanceId);

  const data = {
    ResponsibleId: localStorage.getItem("userId"),
    ReturnId: returnId,
    InstanceId: instanceId
  };

  try
  {
    const response = await fetch("http://localhost:5009/ReturnRequisition/ConfirmReturn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    const url = `http://localhost:5009/ReturnRequisition/GetReturnList`;
    const response = await fetch(url);
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
    const url = `http://localhost:5009/RequestRequisition/GetRequestList`;
    const response = await fetch(url);
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
    const response = await fetch(`http://localhost:5009/RequestRequisition/GetRequestListById?requestId=${requestId}`);
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
    const response = await fetch("http://localhost:5009/Item/GetInstance");
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
    ReasonRejected: decision === "2" ? rejectReason : null,
    ResponsibleId: localStorage.getItem("userId")
  };

  try
  {
    const response = await fetch("http://localhost:5009/RequestRequisition/SetRequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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