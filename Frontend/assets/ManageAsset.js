function ToManageUserPage() {
  window.location.href = "/Frontend/ManageUser.html"; 
}
function ToManageAssetInSystemPage(){
  window.location.href = "/Frontend/ManageAssetInSystem.html"
}

document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
      return;
    }
  
    const url = `http://localhost:5009/RequestRequisition/GetAssetList?requesterId=${userId}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      displayAssets(data);
    } catch (error) {
      console.error("Error fetching asset list:", error);
      alert("ไม่สามารถโหลดข้อมูลได้");
    }
  });
  
document
.getElementById("nav-held-assets")
.addEventListener("click", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
    return;
  }

  const url = `http://localhost:5009/RequestRequisition/GetAssetList?requesterId=${userId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayAssets(data);
  } catch (error) {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถโหลดข้อมูลได้");
  }
});

document
.getElementById("nav-held-request")
.addEventListener("click", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
    return;
  }

  const url = `http://localhost:5009/RequestRequisition/GetRequest?userId=${userId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayRequest(data);
  } catch (error) {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถโหลดข้อมูลได้");
  }
});
document
.getElementById("nav-held-Confirm")
.addEventListener("click", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
    return;
  }

  const url = `http://localhost:5009/RequestRequisition/GetConfirmList?requesterId=${userId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayConfirm(data);
  } catch (error) {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถโหลดข้อมูลได้");
  }
});

function displayConfirm(data) {
const container = document.getElementById("asset-container");
container.innerHTML =
  '<div class="table-header">ยืนยันการได้รับทรัพย์สิน</div>'; // ล้างข้อมูลเก่าก่อน

if (data.length === 0) {
  container.innerHTML += "<p>ไม่มีข้อมูลทรัพย์สินที่ถืออยู่</p>";
  return;
}

// สร้างตาราง
const table = document.createElement("table");
table.innerHTML = `
  <thead>
    <tr>
        <th>ลำดับที่</th>
        <th>หมวดหมู่</th>
        <th>การจำแนกประเภท</th>
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


// เพิ่มตารางลงใน container
container.appendChild(table);
}

function displayRequest(data) {
const container = document.getElementById("asset-container");
container.innerHTML =
  `<div style="display: flex; align-items: center;">
  <div style="flex-grow: 1; text-align: center;" class="table-header">ใบคำขออนุมัติการเบิก</div>
  <div><button id="openRequisitionModalBtn">สร้างใบคำขออนุมัติการเบิก</button></div>
</div>
`; 

const openRequisitionModalBtn = document.getElementById("openRequisitionModalBtn");
  if (openRequisitionModalBtn) {
    openRequisitionModalBtn.addEventListener("click", async () => {
      requisitionModal.style.display = "flex";
      loadCategoriesRequisition();
    });
  }

  const closeRequisitionModalBtn = document.getElementById("closeRequisitionModalBtn");
  if (closeRequisitionModalBtn) {
    closeRequisitionModalBtn.addEventListener("click", () => {
      requisitionModal.style.display = "none";
    });
  }

  submitRequisitionBtn.addEventListener('click', async () => {
    const selectedAsset = assetSelectRequisition.value;
    const returnMessage = document.getElementById('returnMessageRequisition').value;
    const resonMessage = document.getElementById('reasonMessageRequisition').value;
    const dueDate = document.getElementById('dateSelectRequisition').value;
    
    // เตรียมข้อมูลสำหรับส่งไปยัง API
    const requestData = {
      RequesterId: localStorage.getItem("userId"),
      CategoryId: parseInt(selectedAsset), // ใช้ InstanceId ที่เลือก
      Requirement: returnMessage, // ข้อความที่ผู้ใช้ใส่
      ReasonRequest: resonMessage,
      DueDate: dueDate
    };
  
    try {
      const response = await fetch('http://localhost:5009/RequestRequisition/CreateRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert(result.message || 'ส่งข้อมูลสำเร็จ');
        requisitionModal.style.display = 'none'; // ปิด Modal หลังส่งสำเร็จ
        refreshTableAssetList()
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
      }
    } catch (error) {
      console.error('Error sending data to API:', error);
      alert('ไม่สามารถเชื่อมต่อกับ API ได้');
    }
  });

  async function refreshTableAssetList() {
    try {
      const userId = localStorage.getItem("userId");
      const url = `http://localhost:5009/RequestRequisition/GetRequest?userId=${userId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch updated data");
      }
      const data = await response.json();
      displayRequest(data); // เรียกฟังก์ชันเดิมเพื่อแสดงข้อมูลใหม่
    } catch (error) {
      console.error("Error refreshing table:", error);
    }
  }

if (data.length === 0) {
  container.innerHTML += "<p>ไม่มีข้อมูลทรัพย์สินที่ถืออยู่</p>";
  return;
}

// สร้างตาราง
const table = document.createElement("table");
table.innerHTML = `
      <thead>
        <tr>
          <th>ลำดับที่</th>
          <th>หมวดหมู่</th>
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
            <td>${item.assetId}</td>
            <td>${item.reasonRejected || '-'}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;

// เพิ่มตารางลงใน container
container.appendChild(table);
}

function displayAssets(data) {
const container = document.getElementById("asset-container");
container.innerHTML =
  '<div class="table-header">ทรัพย์สินที่ถือครอง</div>'; // ล้างข้อมูลเก่าก่อน

if (data.length === 0) {
  container.innerHTML += "<p>ไม่มีข้อมูลทรัพย์สินที่ถืออยู่</p>";
  return;
}

// สร้างตาราง
const table = document.createElement("table");
table.innerHTML = `
  <thead>
    <tr>
      <th>ลำดับที่</th>
      <th>หมวดหมู่</th>
      <th>การจำแนกประเภท</th>
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

// เพิ่มตารางลงใน container
container.appendChild(table);
}

// เปิด Modal สำหรับใบคืนทรัพย์สิน
const openReturnAssetModalBtn = document.getElementById("openReturnAssetModalBtn");
const returnAssetModal = document.getElementById("returnAssetModal");
const closeReturnAssetModalBtn = document.getElementById("closeReturnAssetModalBtn");

openReturnAssetModalBtn.addEventListener("click", async () => {
  returnAssetModal.style.display = "flex";

  // ดึงข้อมูลจาก API
  try {
    const requesterId = localStorage.getItem("userId");
    const response = await fetch(
      `http://localhost:5009/RequestRequisition/GetAssetList?requesterId=${requesterId}`
    );
    const data = await response.json();

    if (response.ok) {
      const assetSelect = document.getElementById("assetSelect");
      assetSelect.innerHTML = '<option value="">-- กรุณาเลือกทรัพย์สิน --</option>';
      data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.instanceId;
        option.textContent = `${item.categoryName} - ${item.classificationName} (${item.assetId})`;
        assetSelect.appendChild(option);
      });
    } else {
      alert(data.Message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
  } catch (error) {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถเชื่อมต่อกับ API ได้");
  }
});

// ปิด Modal สำหรับใบคืนทรัพย์สิน
closeReturnAssetModalBtn.addEventListener("click", () => {
  returnAssetModal.style.display = "none";
});

// ส่งข้อมูล
submitReturnBtn.addEventListener('click', async () => {
    const selectedAsset = assetSelect.value;
    const returnMessage = document.getElementById('returnMessage').value;
    
    // เตรียมข้อมูลสำหรับส่งไปยัง API
    const requestData = {
      RequesterId: localStorage.getItem("userId"),
      InstanceId: parseInt(selectedAsset), // ใช้ InstanceId ที่เลือก
      ReasonReturn: returnMessage // ข้อความที่ผู้ใช้ใส่
    };
  
    try {
      const response = await fetch('http://localhost:5009/ReturnRequisition/CreateReturn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert(result.Message || 'ส่งข้อมูลสำเร็จ');
        modal.style.display = 'none'; // ปิด Modal หลังส่งสำเร็จ
      } else {
        alert(result.Message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
      }
    } catch (error) {
      console.error('Error sending data to API:', error);
      alert('ไม่สามารถเชื่อมต่อกับ API ได้');
    }
  });
  




// เปิด Modal สำหรับใบคำขออนุมัติการเบิก
const openRequisitionModalBtn = document.getElementById("openRequisitionModalBtn");
const requisitionModal = document.getElementById("requisitionModal");
const closeRequisitionModalBtn = document.getElementById("closeRequisitionModalBtn");

openRequisitionModalBtn.addEventListener("click", async () => {
  requisitionModal.style.display = "block";
  loadCategoriesRequisition();  // ดึงข้อมูลหมวดหมู่จาก API สำหรับใบคำขออนุมัติการเบิก
});

// ปิด Modal สำหรับใบคำขออนุมัติการเบิก
closeRequisitionModalBtn.addEventListener("click", () => {
  requisitionModal.style.display = "none";
});

// ฟังก์ชันดึงข้อมูลหมวดหมู่จาก API สำหรับใบคำขออนุมัติการเบิก
async function loadCategoriesRequisition() {
  try {
    const response = await fetch('http://localhost:5009/Item/GetCategory');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();

    // เพิ่มข้อมูลหมวดหมู่ลงใน <select>
    const assetSelectRequisition = document.getElementById("assetSelectRequisition");
    assetSelectRequisition.innerHTML = '<option value="">-- กรุณาเลือกทรัพย์สิน --</option>'; // ล้างข้อมูลเก่า
    data.forEach(item => {
      const option = document.createElement("option");
      option.value = item.categoryId;
      option.textContent = item.categoryName;
      assetSelectRequisition.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching category data:', error);
  }
}



// ปิด Modal เมื่อคลิกนอกพื้นที่
window.addEventListener("click", (event) => {
  if (event.target === returnAssetModal) {
    returnAssetModal.style.display = "none";
  }
  if (event.target === requisitionModal) {
    requisitionModal.style.display = "none";
  }
});


document.getElementById("asset-container").appendChild(table);

// ฟังก์ชันสำหรับยืนยันการรับทรัพย์สิน
async function confirmAction(requestId) {
  const confirmData = { RequestId: requestId }; // เตรียมข้อมูลสำหรับส่งไปยัง API

  try {
    const response = await fetch("http://localhost:5009/RequestRequisition/ConfirmRequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(confirmData), // ส่งข้อมูลในรูปแบบ JSON
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message || "ยืนยันการรับทรัพย์สินสำเร็จ");
      // รีเฟรชตารางหรืออัปเดตข้อมูลใหม่
      refreshTable();
    } else {
      alert(resultmessage || "เกิดข้อผิดพลาดในการยืนยัน");
    }
  } catch (error) {
    console.error("Error confirming request:", error);
    alert("ไม่สามารถเชื่อมต่อกับ API ได้");
  }
}

// ฟังก์ชันสำหรับรีเฟรชตารางหลังจากยืนยัน
async function refreshTable() {
  try {
    const userId = localStorage.getItem("userId");
    const url = `http://localhost:5009/RequestRequisition/GetConfirmList?requesterId=${userId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch updated data");
    }
    const data = await response.json();
    displayConfirm(data); // เรียกฟังก์ชันเดิมเพื่อแสดงข้อมูลใหม่
  } catch (error) {
    console.error("Error refreshing table:", error);
  }
}

