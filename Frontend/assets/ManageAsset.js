function ToManageUserPage()
{
  window.location.href = "/Frontend/ManageUser.html";
}
function ToManageAssetInSystemPage()
{
  window.location.href = "/Frontend/ManageAssetInSystem.html"
}
function ToManageRequestReturnPage()
{
  window.location.href = "/Frontend/ManageRequestReturn.html"
}
function ToLoginPage()
{
  localStorage.removeItem('token');
  const logoutUrl = `http://localhost:8080/realms/Requisition/protocol/openid-connect/logout`;
  window.location.href = logoutUrl;
  window.location.href = "/Frontend/login.html"
}

document.addEventListener("DOMContentLoaded", async () =>
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/RequestRequisition/GetUserAsset`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    const result = await response.json();

    if (response.status == 200)
    {
      displayAssets(result);
    } else
    {
      alert(result.message);
    }
  } catch (error)
  {
    console.error("Error fetching asset list:", error);
  }
});

document.getElementById("nav-held-assets").addEventListener("click", async () =>
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/RequestRequisition/GetUserAsset`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    const result = await response.json();

    if (response.status == 200)
    {
      displayAssets(result);
    } else
    {
      alert(result.message);
    }
  } catch (error)
  {
    console.error("Error fetching asset list:", error);
  }
});

document.getElementById("nav-held-request").addEventListener("click", async () =>
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/RequestRequisition/GetRequest`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    const result = await response.json();

    if (response.status == 200)
    {
      displayRequest(result);
    } else
    {
      alert(result.message);
    }
  } catch (error)
  {
    console.error("Error fetching asset list:", error);
  }
});
document.getElementById("nav-held-Confirm").addEventListener("click", async () =>
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/RequestRequisition/GetConfirmList`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();

    if (response.status == 200)
    {
      displayConfirm(result);
    } else
    {
      alert(result.message);
    }
  } catch (error)
  {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถโหลดข้อมูลได้");
  }
});

function displayConfirm(data)
{
  const container = document.getElementById("asset-container");
  container.innerHTML =
    '<div class="table-header">รายการยืนยันการได้รับทรัพย์สิน</div>';

  if (data.length === 0)
  {
    container.innerHTML += "<p>ไม่มีรายการยืนยันการได้รับทรัพย์สิน</p>";
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

function displayRequest(data)
{
  const container = document.getElementById("asset-container");
  container.innerHTML =
    `<div style="display: flex; align-items: center;">
  <div style="flex-grow: 1; text-align: center;" class="table-header">รายการใบคำขออนุมัติการเบิก</div>
  <div><button id="openRequisitionModalBtn">สร้างใบคำขออนุมัติการเบิก</button></div>
</div>
`;

  if (data.length === 0)
  {
    container.innerHTML += "<p>ไม่มีใบคำขออนุมัติการเบิก</p>";
    return;
  }

  // สร้างตาราง
  const table = document.createElement("table");
  table.innerHTML = `
      <thead>
        <tr>
          <th>ลำดับที่</th>
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
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.categoryName}</td>
            <td>${item.requirement}</td>
            <td>${item.dueDate}</td>
            <td>${item.reasonRequest}</td>
            <td>${item.status}</td>
            <td>${item.assetId || '-'}</td>
            <td>${item.reasonRejected || '-'}</td>
          </tr>
        `
      )
      .join("")}
      </tbody>
    `;

  // เพิ่มตารางลงใน container
  container.appendChild(table);

  const openRequisitionModalBtn = document.getElementById("openRequisitionModalBtn");
  if (openRequisitionModalBtn)
  {
    openRequisitionModalBtn.addEventListener("click", async () =>
    {
      requisitionModal.style.display = "flex";
      loadCategoriesRequisition();
    });
  }

  const closeRequisitionModalBtn = document.getElementById("closeRequisitionModalBtn");
  if (closeRequisitionModalBtn)
  {
    closeRequisitionModalBtn.addEventListener("click", () =>
    {
      requisitionModal.style.display = "none";
    });
  }

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
      const response = await fetch('http://localhost:5009/RequestRequisition/CreateRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (response.status == 201)
      {
        alert(result.message);
        refreshTableAssetList()
        requisitionModal.style.display = 'none';
      } else
      {
        alert(result.message);
      }
    } catch (error)
    {
      console.error('Error sending data to API:', error);
    }
  });

  async function refreshTableAssetList()
  {
    try
    {
      const response = await fetch(`http://localhost:5009/RequestRequisition/GetRequest`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const result = await response.json();

      if (response.status == 200)
      {
        displayRequest(result);
      } else
      {
        alert(result.message);
      }
    } catch (error)
    {
      console.error("Error refreshing table:", error);
    }
  }
}

function displayAssets(data)
{
  const container = document.getElementById("asset-container");
  container.innerHTML =
    '<div class="table-header">รายการทรัพย์สินที่ถือครอง</div>'; 

  if (data.length === 0)
  {
    container.innerHTML += "<p>ไม่มีทรัพย์สินที่ถืออยู่</p>";
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

const openReturnAssetModalBtn = document.getElementById("openReturnAssetModalBtn");
const returnAssetModal = document.getElementById("returnAssetModal");
const closeReturnAssetModalBtn = document.getElementById("closeReturnAssetModalBtn");

openReturnAssetModalBtn.addEventListener("click", async () =>
{
  returnAssetModal.style.display = "flex";

  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(
      `http://localhost:5009/RequestRequisition/GetUserAsset`, {
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

closeReturnAssetModalBtn.addEventListener("click", () =>
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
    const response = await fetch('http://localhost:5009/ReturnRequisition/CreateReturn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();

    if (response.ok)
    {
      alert(result.message || 'ส่งข้อมูลสำเร็จ');
      modal.style.display = 'none'; 
    } else
    {
      alert(result.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    }
  } catch (error)
  {
    console.error('Error sending data to API:', error);
    alert('ไม่สามารถเชื่อมต่อกับ API ได้');
  }
});

async function loadCategoriesRequisition()
{
  try
  {
    const response = await fetch('http://localhost:5009/Item/GetCategory', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error('Failed to fetch categories');
    }
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
    const response = await fetch("http://localhost:5009/RequestRequisition/ConfirmRequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(confirmData),
    });

    const result = await response.json();

    if (response.ok)
    {
      alert(result.message || "ยืนยันการรับทรัพย์สินสำเร็จ");
      refreshTable();
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

async function refreshTable()
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/RequestRequisition/GetConfirmList`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const result = await response.json();

    if (response.status == 200)
    {
      displayConfirm(result);
    } else
    {
      alert(result.message);
    }
  } catch (error)
  {
    console.error("Error refreshing table:", error);
  }
}

