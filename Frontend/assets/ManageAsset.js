import { API_URL, RequestStatus } from "/Frontend/assets/config.js";

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

document.addEventListener("DOMContentLoaded", async () =>
{
  fetchGetUserAsset()
});

document.getElementById("assets").addEventListener("click", async () =>
{
  fetchGetUserAsset()
});

document.getElementById("request").addEventListener("click", async () =>
{
  fetchGetRequest()
});
document.getElementById("Confirm").addEventListener("click", async () =>
{
  fetchGetConfirmList()
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


async function fetchGetUserAsset()
{
  try
  {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/RequestRequisition/GetUserAsset`, {
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
    displayAssets(result.data);
    updatePaginationControls(fetchGetUserAsset);
    updateTotalItemsDisplay();

  } catch (error)
  {
    console.error("Error:", error);
  }
}

async function fetchGetRequest()
{
  try
  {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/RequestRequisition/GetRequest`, {
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
    displayRequest(result.data);
    updatePaginationControls(fetchGetRequest);
    updateTotalItemsDisplay();

  } catch (error)
  {
    console.error("Error:", error);
  }
}

async function fetchGetConfirmList()
{
  try
  {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/RequestRequisition/GetConfirmList`, {
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
    displayConfirm(result.data);
    updatePaginationControls(fetchGetConfirmList);
    updateTotalItemsDisplay();

  } catch (error)
  {
    console.error("Error:", error);
  }
}


function displayAssets(data)
{
  const container = document.getElementById("asset-container");
  container.innerHTML = `
  <label for="pageSizeSelect">จำนวนต่อหน้า:</label>
  <select id="pageSizeSelect" onchange="changePageSize(Number(this.value), fetchGetUserAsset)">
    <option value="3">3</option>
    <option value="7">7</option>
    <option value="10" selected>10</option>
  </select>
  <div class="table-header">รายการทรัพย์สินที่ถือครอง</div>`;

  if (data.length === 0)
  {
    container.innerHTML += `<p style="text-align: center;">ไม่มีทรัพย์สินที่ถืออยู่</p>`;
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
  <thead>
    <tr>
      <th>ลำดับที่</th>
      <th>หมวดหมู่ของทรัพย์สิน</th>
      <th>การจำแนกทรัพย์สิน</th>
      <th>รหัสทรัพย์สิน</th>
    </tr>
  </thead>
  <tbody>
    ${data
      .map(
        (item, index) => `
      <tr>
        <td>${index + 1}</td>
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

function displayRequest(data)
{
  const container = document.getElementById("asset-container");
  container.innerHTML =
    `
    <label for="pageSizeSelect">จำนวนต่อหน้า:</label>
  <select id="pageSizeSelect" onchange="changePageSize(Number(this.value), fetchGetRequest)">
    <option value="3">3</option>
    <option value="7">7</option>
    <option value="10" selected>10</option>
  </select>
    <div style="display: flex; align-items: center;">
  <div style="flex-grow: 1; text-align: center;" class="table-header">รายการใบคำขออนุมัติการเบิก</div>
  <div><button id="openRequisitionModalBtn">สร้างใบคำขออนุมัติการเบิก</button></div>
</div>
`;

  if (data.length === 0)
  {
    container.innerHTML += `<p style="text-align: center;">ไม่มีใบคำขออนุมัติการเบิก</p>`;
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
      <thead>
        <tr>
          <th>ใบขอเบิกลำดับที่</th>
          <th>หมวดหมู่ของทรัพย์สิน</th>
          <th>คุณสมบัติที่ต้องการ</th>
          <th>วันที่ต้องการใช้งาน </th>
          <th>เหตุผลในการขอเบิก</th>
          <th>สถานะคำร้อง</th>
          <th>รหัสทรัพย์สิน</th>
          <th>เหตุผลในการปฏิเสธ</th>
        </tr>
      </thead>
      <tbody>
        ${data
      .map(
        (item) => `
          <tr>
            <td>${padNumber(item.requestId,5)}</td>
            <td>${item.categoryName}</td>
            <td>${item.requirement}</td>
            <td>${item.dueDate}</td>
            <td>${item.reasonRequest}</td>
            <td>${RequestStatus[item.status] || '-'}</td>
            <td>${item.assetId || '-'}</td>
            <td>${item.reasonRejected || '-'}</td>
          </tr>
        `
      )
      .join("")}
      </tbody>
    `;

  container.appendChild(table);

  const openRequisitionModalBtn = document.getElementById("openRequisitionModalBtn");
  openRequisitionModalBtn.addEventListener("click", async () =>
  {
    requisitionModal.style.display = "flex";
    loadCategoriesRequisition();
  });


  const closeRequisitionModalBtn = document.getElementById("closeRequisitionModalBtn");
  closeRequisitionModalBtn.addEventListener("click", () =>
  {
    requisitionModal.style.display = "none";
  });

  submitRequisitionBtn.addEventListener('click', async () =>
  {
    const selectedAsset = assetSelectRequisition.value;
    const returnMessage = document.getElementById('returnMessageRequisition').value;
    const resonMessage = document.getElementById('reasonMessageRequisition').value;
    const dueDate = document.getElementById('dateSelectRequisition').value;

    const requestData = {
      CategoryId: parseInt(selectedAsset),
      Requirement: returnMessage,
      ReasonRequest: resonMessage,
      DueDate: dueDate
    };

    try
    {
      let token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/RequestRequisition/CreateRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (result.statusCode == 201)
      {
        requisitionModal.style.display = "none";
        fetchGetRequest()
        alert(result.message);
      } else
      {
        alert(result.message || "กรอกข้อมูลไม่ครบ");
      }
    } catch (error)
    {
      console.error('Error sending data to API:', error);
    }
  });
}

function displayConfirm(data)
{
  const container = document.getElementById("asset-container");
  container.innerHTML = `
  <label for="pageSizeSelect">จำนวนต่อหน้า:</label>
  <select id="pageSizeSelect" onchange="changePageSize(Number(this.value), fetchGetConfirmList)">
    <option value="3">3</option>
    <option value="7">7</option>
    <option value="10" selected>10</option>
  </select>
  <div class="table-header">รายการยืนยันการได้รับทรัพย์สิน</div>`;

  if (data.length === 0)
  {
    container.innerHTML += `<p style="text-align: center;">ไม่มีรายการยืนยันการได้รับทรัพย์สิน</p>`;
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
  <thead>
    <tr>
        <th>ลำดับที่</th>
        <th>หมวดหมู่ของทรัพย์สิน</th>
        <th>การจำแนกประเภทของทรัพย์สิน</th>
        <th>รหัสทรัพย์สิน</th>
        <th>ยืนยันการได้รับ</th> 
    </tr>
  </thead>
  <tbody>
    ${data
      .map(
        (item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.categoryName}</td>
            <td>${item.classificationName}</td>
            <td>${item.assetId}</td>
            <td><button class="btn-confirm" onclick="confirmAction(${item.requestId})">ยืนยัน</button></td> 
        </tr>
    `
      )
      .join("")}
  </tbody>
`;

  container.appendChild(table);
}



const returnAssetModal = document.getElementById("returnAssetModal");

document.getElementById("openReturnAssetModalBtn").addEventListener("click", async () =>
{
  returnAssetModal.style.display = "flex";

  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(
      `${API_URL}/RequestRequisition/GetUserAsset`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    const data = await response.json();

    if (response.ok)
    {
      const assetSelect = document.getElementById("assetSelect");
      assetSelect.innerHTML = '<option value="">-- กรุณาเลือกทรัพย์สิน --</option>';
      data.forEach((item) =>
      {
        const option = document.createElement("option");
        option.value = item.instanceId;
        option.textContent = `${item.categoryName} - ${item.classificationName} (${item.assetId})`;
        assetSelect.appendChild(option);
      });
    } else
    {
      alert(data.Message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
  } catch (error)
  {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถเชื่อมต่อกับ API ได้");
  }
});

document.getElementById("closeReturnAssetModalBtn").addEventListener("click", () =>
{
  returnAssetModal.style.display = "none";
});

submitReturnBtn.addEventListener('click', async () =>
{
  const selectedAsset = assetSelect.value;
  const returnMessage = document.getElementById('returnMessage').value;

  const requestData = {
    InstanceId: parseInt(selectedAsset),
    ReasonReturn: returnMessage
  };

  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ReturnRequisition/CreateReturn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();

    if (response.status == 200)
    {
      returnAssetModal.style.display = 'none';
      alert(result.message || 'ส่งข้อมูลสำเร็จ');
    } else
    {
      alert(result.message || 'กรอกข้อมูลไม่ครบ');
    }
  } catch (error)
  {
    console.error('Error sending data to API:', error);
  }
});

async function loadCategoriesRequisition()
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/Item/GetCategory`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    const data = await response.json();

    const assetSelectRequisition = document.getElementById("assetSelectRequisition");
    assetSelectRequisition.innerHTML = '<option value="">-- กรุณาเลือกทรัพย์สิน --</option>';
    data.forEach(item =>
    {
      const option = document.createElement("option");
      option.value = item.categoryId;
      option.textContent = item.categoryName;
      assetSelectRequisition.appendChild(option);
    });
  } catch (error)
  {
    console.error('Error fetching category data:', error);
  }
}

window.addEventListener("click", (event) =>
{
  if (event.target === returnAssetModal)
  {
    returnAssetModal.style.display = "none";
  }
  if (event.target === requisitionModal)
  {
    requisitionModal.style.display = "none";
  }
});

async function confirmAction(requestId)
{
  const confirmData = { RequestId: requestId };

  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/RequestRequisition/ConfirmRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(confirmData),
    });

    const result = await response.json();

    if (response.ok)
    {
      alert(result.message || "ยืนยันการรับทรัพย์สินสำเร็จ");
      fetchGetConfirmList()
    } else
    {
      alert(resultmessage || "เกิดข้อผิดพลาดในการยืนยัน");
    }
  } catch (error)
  {
    console.error("Error confirming request:", error);
    alert("ไม่สามารถเชื่อมต่อกับ API ได้");
  }
}


window.confirmAction = confirmAction;
window.changePage = changePage;
window.changePageSize = changePageSize;
window.fetchGetUserAsset = fetchGetUserAsset;
window.fetchGetRequest = fetchGetRequest;
window.fetchGetConfirmList = fetchGetConfirmList;
