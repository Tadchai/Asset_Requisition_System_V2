import { API_URL, AssetIdStatus } from "/Frontend/assets/config.js";
import {
  loadCategories,
  loadClassification,
  loadUsersFromData,
  loadName,
} from "/Frontend/assets/utils.js";

loadName();

document
  .getElementById("ToManageAssetPage")
  .addEventListener("click", async () => {
    window.location.href = "/Frontend/ManageAsset.html";
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

document.getElementById("AssetSystem").addEventListener("click", async () => {
  fetchGetAssetId();
});

document
  .getElementById("ManageCategory")
  .addEventListener("click", async () => {
    fetchGetCategory();
  });

document
  .getElementById("ManageClassification")
  .addEventListener("click", async () => {
    fetchGetClassification();
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

async function fetchGetAssetId(previousCursor, nextCursor) {
  try {
    const token = localStorage.getItem("token");

    const requestBody = {
      PageSize: pageSize,
      PreviousCursor: previousCursor,
      NextCursor: nextCursor,
      userId: document.getElementById("userId")?.value,
      categoryId: document.getElementById("categoryId")?.value,
      assetId: document.getElementById("assetId")?.value,
      status: document.getElementById("status")?.value,
      startDate: document.getElementById("startDate")?.value,
      endDate: document.getElementById("endDate")?.value,
    };

    const body = JSON.stringify(requestBody, (key, value) =>
      value === "" ? null : value
    );

    const response = await fetch(`${API_URL}/Item/GetAssetId`, {
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

    displayAssetId(result.data);
    updatePaginationControls(fetchGetAssetId);
    updatePage(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchGetCategory(previousCursor, nextCursor) {
  try {
    const token = localStorage.getItem("token");

    const requestBody = {
      PageSize: pageSize,
      PreviousCursor: previousCursor,
      NextCursor: nextCursor,
    };

    const body = JSON.stringify(requestBody, (key, value) =>
      value === "" ? null : value
    );

    const response = await fetch(`${API_URL}/Item/GetCategory`, {
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

    displayCategory(result.data);
    updatePaginationControls(fetchGetCategory);
    updatePage(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchGetClassification(previousCursor, nextCursor) {
  try {
    const token = localStorage.getItem("token");

    const requestBody = {
      PageSize: pageSize,
      PreviousCursor: previousCursor,
      NextCursor: nextCursor,
      categoryId: document.getElementById("categoryId")?.value,
    };

    const body = JSON.stringify(requestBody, (key, value) =>
      value === "" ? null : value
    );

    const response = await fetch(`${API_URL}/Item/GetClassification`, {
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

    displayClassification(result.data);
    updatePaginationControls(fetchGetClassification);
    updatePage(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

function displayAssetId(data) {
  const container = document.getElementById("asset-container");

  const filters = {
    userId: document.getElementById("userId")?.value || "",
    categoryId: document.getElementById("categoryId")?.value || "",
    status: document.getElementById("status")?.value || "",
    assetId: document.getElementById("assetId")?.value || "",
  };

  container.innerHTML = `
    <div class="table-header">
      <h2>รายการทรัพย์สินทั้งหมดในระบบ</h2>
      <button onclick="openCreateAsset()">เพิ่มทรัพย์สินใหม่</button>
    </div>
<div class="table-controls">
  <span>ข้อมูลทั้งหมด: <span id="RowCountDisplay">0</span> รายการ</span>
  <div class="page-size">
    <label for="pageSizeSelect">จำนวนต่อหน้า:</label>
    <select id="pageSizeSelect" onchange="changePageSize(Number(this.value), fetchGetAssetId)">
      <option value="3">3</option>
      <option value="7">7</option>
      <option value="10" selected>10</option>
    </select>
  </div>
</div>
    <div>
        <label for="categoryId">หมวดหมู่:</label>
        <select id="categoryId">
          <option value="">-</option>
        </select>
        <label for="assetId">รหัสทรัพย์สิน:</label>
        <input type="text" id="assetId" name="assetId">
        <label for="userId">ชื่อผู้ถือครอง:</label>
        <select id="userId">
          <option value="">-</option>
        </select>
        <label for="status">สถานะ:</label>
        <select name="status" id="status">
          <option value="">-</option>
          <option value="0">Available</option>
          <option value="1">EndofLife</option>
          <option value="2">Missing</option>
        </select>
        <label for="startDate">ตั้งแต่วันที่:</label>
        <input type="date" id="startDate" name="startDate"><br>
        <label for="endDate">ถึงวันที่:</label>
        <input type="date" id="endDate" name="endDate">
        <button onclick="search(fetchGetAssetId)">ค้นหา</button>
    </div>
    `;
  loadCategories();
  loadUsersFromData();

  document.getElementById("userId").value = filters.userId;
  document.getElementById("categoryId").value = filters.categoryId;
  document.getElementById("status").value = filters.status;
  document.getElementById("assetId").value = filters.assetId;

  if (data == null || data.length === 0) {
    container.innerHTML += `<p style="text-align: center;">ไม่มีข้อมูลทรัพย์สิน</p>`;
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
          <th>ชื่อผู้ถือครองทรัพย์สิน</th>
          <th>สถานะของทรัพย์สิน</th>
          <th>วันที่ได้มาทรัพย์สิน</th>
          <th></th>
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
            <td>${
              item.firstName || item.lastName
                ? `${item.firstName} ${item.lastName}`
                : "-"
            }</td>
            <td>${AssetIdStatus[item.status] || "-"}</td>
            <td>${item.acquisitonDate}</td>
            <td>
            <button class="btn-confirm" onclick="editStatusAction(${
              item.instanceId
            })">เปลี่ยนสถานะ</button>
            <button class="btn-confirm" onclick="editInstanceAction(${
              item.instanceId
            })">แก้ไขทรัพย์สิน</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;

  container.appendChild(table);
}

function displayCategory(data) {
  const container = document.getElementById("asset-container");
  container.innerHTML = `
    <div class="table-header">
  <h2>หมวดหมู่ของทรัพย์สินทั้งหมดในระบบ</h2>
  <button id="openCategoryModalBtn">สร้างหมวดหมู่ของทรัพย์สิน</button>
</div>

<div class="table-controls">
  <span>ข้อมูลทั้งหมด: <span id="RowCountDisplay">0</span> รายการ</span>
  
  <div class="page-size">
    <label for="pageSizeSelect">จำนวนต่อหน้า:</label>
    <select id="pageSizeSelect" onchange="changePageSize(Number(this.value), fetchGetCategory)">
      <option value="3">3</option>
      <option value="7">7</option>
      <option value="10" selected>10</option>
    </select>
  </div>
</div>`;

  if (data == null || data.length === 0) {
    container.innerHTML += `<p style="text-align: center;">ไม่มีข้อมูลหมวดหมู่ของทรัพย์สิน</p>`;
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
      <thead>
        <tr>
          <th>ลำดับที่</th>
          <th>หมวดหมู่ของทรัพย์สิน</th>
          <th>คำอธิบายของหมวดหมู่ของทรัพย์สิน</th>
          <th>จำนวนที่ต้องการสำรอง</th>
          <th>หน่วยนับ</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map(
            (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.categoryName}</td>
            <td>${item.description}</td>
            <td>${item.reservedQuantity}</td>
            <td>${item.unit}</td>
            <td><button class="btn-confirm" onclick="editCategoryAction(${
              item.categoryId
            })">แก้ไข</button></td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;

  container.appendChild(table);

  document
    .getElementById("openCategoryModalBtn")
    .addEventListener("click", async () => {
      CategoryModal.style.display = "flex";
    });
  document.getElementById("closeModalBtn").addEventListener("click", () => {
    CategoryModal.style.display = "none";
  });

  submitCategory.addEventListener("click", async () => {
    const CategoryName = document.getElementById("CategoryName").value;
    const CategoryDescription = document.getElementById(
      "CategoryDescription"
    ).value;
    const CategoryUnit = document.getElementById("CategoryUnit").value;
    const CategoryPreparation = document.getElementById(
      "CategoryPreparation"
    ).value;

    const requestData = {
      Name: CategoryName,
      Description: CategoryDescription,
      Unit: CategoryUnit,
      ReservedQuantity: CategoryPreparation,
    };

    try {
      let token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/Item/CreateCategory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });
      const result = await response.json();

      if (result.statusCode === 201) {
        CategoryModal.style.display = "none";
        fetchGetCategory();
        alert(result.message);
      } else {
        alert(result.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
      }
    } catch (error) {
      console.error("Error sending data to API:", error);
      alert("ไม่สามารถเชื่อมต่อกับ API ได้");
    }
  });
}

function displayClassification(data) {
  const container = document.getElementById("asset-container");

  const filters = {
    categoryId: document.getElementById("categoryId")?.value || "",
  };

  container.innerHTML = `
    <div class="table-header">
  <h2>การจำแนกประเภทของทรัพย์สินทั้งหมดในระบบ</h2>
  <button id="openClassificationModalBtn">สร้างการจำแนกประเภทของทรัพย์สิน</button>
</div>

<div class="table-controls">
  <span>ข้อมูลทั้งหมด: <span id="RowCountDisplay">0</span> รายการ</span>
  
  <div class="page-size">
    <label for="pageSizeSelect">จำนวนต่อหน้า:</label>
    <select id="pageSizeSelect" onchange="changePageSize(Number(this.value), fetchGetClassification)">
      <option value="3">3</option>
      <option value="7">7</option>
      <option value="10" selected>10</option>
    </select>
  </div>
</div>
<div>
        <label for="categoryId">หมวดหมู่:</label>
        <select id="categoryId">
          <option value="">-</option>
        </select>
        <button onclick="search(fetchGetClassification)">ค้นหา</button>
    </div>
`;
  loadCategories();

  document.getElementById("categoryId").value = filters.categoryId;

  if (data == null || data.length === 0) {
    container.innerHTML += `<p style="text-align: center;">ไม่มีข้อมูลการจำแนกประเภทของทรัพย์สิน</p>`;
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
      <thead>
        <tr>
          <th>ลำดับที่</th>
          <th>หมวดหมู่ของทรัพย์สิน</th>
          <th>การจำแนกประเภทของทรัพย์สิน</th>
          <th>คำอธิบายการจำแนกประเภทของทรัพย์สิน</th>
          <th></th>
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
            <td>${item.description}</td>
            <td><button class="btn-confirm" onclick="editClassificationAction(${
              item.classificationId
            })">แก้ไข</button></td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;

  container.appendChild(table);

  document
    .getElementById("openClassificationModalBtn")
    .addEventListener("click", async () => {
      ClassificationModal.style.display = "flex";

      try {
        let token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/Item/GetCategory`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          const SelectCategory = document.getElementById("SelectCategory");
          SelectCategory.innerHTML =
            '<option value="">-- กรุณาเลือกทรัพย์สิน --</option>';
          data.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.categoryId;
            option.textContent = `${item.categoryName}`;
            SelectCategory.appendChild(option);
          });
        } else {
          alert(data.Message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
        }
      } catch (error) {
        console.error("Error fetching asset list:", error);
        alert("ไม่สามารถเชื่อมต่อกับ API ได้");
      }
    });

  document
    .getElementById("closeClassificationModal")
    .addEventListener("click", () => {
      ClassificationModal.style.display = "none";
    });

  submitClassification.addEventListener("click", async () => {
    const select = SelectCategory.value;
    const ClassificationName =
      document.getElementById("ClassificationName").value;
    const ClassificationDescription = document.getElementById(
      "ClassificationDescription"
    ).value;

    const requestData = {
      CategoryId: parseInt(select),
      Name: ClassificationName,
      Description: ClassificationDescription,
    };

    try {
      let token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/Item/CreateClassification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });
      const result = await response.json();

      if (result.statusCode === 201) {
        ClassificationModal.style.display = "none";
        fetchGetClassification();
        alert(result.message);
      } else {
        alert(result.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
      }
    } catch (error) {
      console.error("Error sending data to API:", error);
      alert("ไม่สามารถเชื่อมต่อกับ API ได้");
    }
  });
}

async function editCategoryAction(categoryId) {
  const modal = document.getElementById("CategoryEditModal");
  modal.style.display = "flex";

  try {
    let token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/Item/GetCategoryById?categoryId=${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const categoryData = await response.json();

    document.getElementById("CategoryEditName").value =
      categoryData.categoryName;
    document.getElementById("CategoryEditDescription").value =
      categoryData.description;
    document.getElementById("CategoryEditUnit").value = categoryData.unit;
    document.getElementById("CategoryEditPreparation").value =
      categoryData.reservedQuantity;
  } catch (error) {
    console.error("Error fetching category data:", error);
    alert("ไม่สามารถโหลดข้อมูลหมวดหมู่ได้");
  }

  document.getElementById("submitEditCategory").onclick = async () => {
    const name = document.getElementById("CategoryEditName").value;
    const description = document.getElementById(
      "CategoryEditDescription"
    ).value;
    const unit = document.getElementById("CategoryEditUnit").value;
    const Preparation = document.getElementById(
      "CategoryEditPreparation"
    ).value;

    const payload = {
      CategoryId: categoryId,
      Name: name,
      Description: description,
      Unit: unit,
      ReservedQuantity: Preparation,
    };

    try {
      let token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/Item/UpdateCategory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok) {
        modal.style.display = "none";
        fetchGetCategory();
        alert(result.message);
      } else {
        alert(result.message || "Failed to update category.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while connecting to the server.");
    }
  };
}

async function editClassificationAction(classificationId) {
  const modal = document.getElementById("ClassificationEditModal");
  modal.style.display = "flex";

  try {
    let token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/Item/GetClassificationById?classificationId=${classificationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const ClassificationData = await response.json();

    document.getElementById("ClassificationEditName").value =
      ClassificationData.classificationName;
    document.getElementById("ClassificationEditDescription").value =
      ClassificationData.description;
  } catch (error) {
    console.error("Error fetching Classification data:", error);
  }

  document.getElementById("submitEditClassification").onclick = async () => {
    const name = document.getElementById("ClassificationEditName").value;
    const description = document.getElementById(
      "ClassificationEditDescription"
    ).value;

    const payload = {
      ClassificationId: classificationId,
      Name: name,
      Description: description,
    };

    try {
      let token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/Item/UpdateClassification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        modal.style.display = "none";
        fetchGetClassification();
      } else {
        alert(result.message || "Failed to update Classification.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while connecting to the server.");
    }
  };
}

async function editInstanceAction(instanceId) {
  const modal = document.getElementById("InstanceEditModal");
  modal.style.display = "flex";

  try {
    let token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/Item/GetInstanceById?instanceId=${instanceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const InstanceData = await response.json();

    document.getElementById("EditAssetPrice").value = InstanceData.price;
    document.getElementById("EditStoreName").value = InstanceData.storeName;
    document.getElementById("EditPreparation").checked =
      InstanceData.preparation;
  } catch (error) {
    console.error("Error fetching Instance data:", error);
  }

  document.getElementById("submitEditInstance").onclick = async () => {
    const EditAssetPrice = document.getElementById("EditAssetPrice").value;
    const EditStoreName = document.getElementById("EditStoreName").value;
    const EditPreparation = document.getElementById("EditPreparation").checked;

    const payload = {
      InstanceId: instanceId,
      Price: EditAssetPrice,
      StoreName: EditStoreName,
      Preparation: EditPreparation,
    };

    try {
      let token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/Item/UpdateInstance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok) {
        modal.style.display = "none";
        fetchGetAssetId();
        alert(result.message);
      } else {
        alert(result.message || "Failed to update Instance.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while connecting to the server.");
    }
  };
}

document.getElementById("closeEditModalBtn").addEventListener("click", () => {
  document.getElementById("CategoryEditName").value = "";
  document.getElementById("CategoryEditDescription").value = "";
  CategoryEditModal.style.display = "none";
});
document
  .getElementById("closeEditClassificationModal")
  .addEventListener("click", () => {
    document.getElementById("ClassificationEditName").value = "";
    document.getElementById("ClassificationEditDescription").value = "";
    ClassificationEditModal.style.display = "none";
  });
document
  .getElementById("closeEditInstanceModal")
  .addEventListener("click", () => {
    document.getElementById("EditAssetPrice").value = "";
    document.getElementById("EditStoreName").value = "";
    document.getElementById("EditPreparation").checked = false;
    InstanceEditModal.style.display = "none";
  });

let usernameValue;
async function editStatusAction(instanceId) {
  const modal = document.getElementById("AssetModal");
  modal.style.display = "flex";

  try {
    let token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/Item/GetAssetIdById?instanceId=${instanceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();

    document.getElementById("categoryName").textContent =
      data.categoryName || "-";
    document.getElementById("categoryDescription").textContent =
      data.categoryDescription || "-";
    document.getElementById("classificationName").textContent =
      data.classificationName || "-";
    document.getElementById("classificationDescription").textContent =
      data.classificationDescription || "-";
    document.getElementById("assetIdModal").textContent = data.assetId || "-";
    document.getElementById("username").textContent =
      data.firstName && data.lastName
        ? `${data.firstName} ${data.lastName}`
        : "-";
    document.getElementById("statusModal").textContent =
      AssetIdStatus[data.status] || "-";
    document.getElementById("price").textContent = data.price || "-";
    document.getElementById("storeName").textContent = data.storeName || "-";
    document.getElementById("preparation").textContent =
      data.preparation || "-";
    document.getElementById("acquisitonDate").textContent =
      data.acquisitonDate || "-";

    document
      .getElementById("btnLost")
      .setAttribute("data-instance-id", instanceId);
    document
      .getElementById("btnEnd")
      .setAttribute("data-instance-id", instanceId);
    document
      .getElementById("btnRestore")
      .setAttribute("data-instance-id", instanceId);

    usernameValue = data.firstName;
    updateButtonVisibility();
  } catch (error) {
    console.error("Error fetching Instance data:", error);
    alert("ไม่สามารถโหลดข้อมูลหมวดหมู่ได้");
  }
}
document.getElementById("closeAssetModalBtn").addEventListener("click", () => {
  document.getElementById("categoryName").textContent = "-";
  document.getElementById("categoryDescription").textContent = "-";
  document.getElementById("classificationName").textContent = "-";
  document.getElementById("classificationDescription").textContent = "-";
  document.getElementById("assetId").textContent = "-";
  document.getElementById("username").textContent = "-";
  document.getElementById("status").textContent = "-";
  document.getElementById("price").textContent = "-";
  document.getElementById("storeName").textContent = "-";
  document.getElementById("preparation").textContent = "-";
  document.getElementById("acquisitonDate").textContent = "-";

  AssetModal.style.display = "none";
});

function updateButtonVisibility() {
  const btnEnd = document.getElementById("btnEnd");
  const btnRestore = document.getElementById("btnRestore");

  if (!usernameValue) {
    btnEnd.style.display = "flex";
  } else {
    btnEnd.style.display = "none";
  }

  if (usernameValue) {
    btnRestore.style.display = "flex";
  } else {
    btnRestore.style.display = "none";
  }
}

document.getElementById("btnLost").addEventListener("click", function () {
  const status = this.getAttribute("data-status");
  const instanceId = this.getAttribute("data-instance-id");
  statusClick(status, instanceId);
});
document.getElementById("btnEnd").addEventListener("click", function () {
  const status = this.getAttribute("data-status");
  const instanceId = this.getAttribute("data-instance-id");
  statusClick(status, instanceId);
});
document.getElementById("btnRestore").addEventListener("click", function () {
  const status = this.getAttribute("data-status");
  const instanceId = this.getAttribute("data-instance-id");
  statusClick(status, instanceId);
});

async function statusClick(status, instanceId) {
  const confirmData = {
    Status: parseInt(status),
    InstanceId: instanceId,
  };

  try {
    let token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/Item/SetAssetId`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(confirmData),
    });
    const result = await response.json();

    if (response.status == 200) {
      alert(result.message);
      fetchGetAssetId();
      AssetModal.style.display = "none";
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error("Error confirming request:", error);
    alert("ไม่สามารถเชื่อมต่อกับ API ได้");
  }
}

function openCreateAsset() {
  const modal = document.getElementById("InstanceModal");
  modal.style.display = "flex";

  loadClassification();
}
function closeCreateAsset() {
  const modal = document.getElementById("InstanceModal");
  modal.style.display = "none";
}

async function submitInstance() {
  const select = document.getElementById("classificationId").value;
  const InstanceName = document.getElementById("InstanceName").value;
  const AssetPrice = document.getElementById("AssetPrice").value;
  const AcquisitonDate = document.getElementById("AcquisitonDate").value;
  const StoreName = document.getElementById("StoreName").value;
  const Preparation = document.getElementById("Preparation").checked;

  const requestData = {
    ClassificationId: parseInt(select),
    AssetId: InstanceName,
    Price: AssetPrice,
    AcquisitonDate: AcquisitonDate,
    StoreName: StoreName,
    Preparation: Preparation,
  };

  try {
    let token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/Item/CreateInstance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });
    const result = await response.json();

    if (result.statusCode === 201) {
      InstanceModal.style.display = "none";
      fetchGetAssetId();
      alert(result.message);
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error("Error sending data to API:", error);
    alert("ไม่สามารถเชื่อมต่อกับ API ได้");
  }
}

window.editStatusAction = editStatusAction;
window.editCategoryAction = editCategoryAction;
window.editClassificationAction = editClassificationAction;
window.editInstanceAction = editInstanceAction;
window.changePageSize = changePageSize;
window.fetchGetClassification = fetchGetClassification;
window.fetchGetCategory = fetchGetCategory;
window.fetchGetAssetId = fetchGetAssetId;
window.search = search;
window.submitInstance = submitInstance;
window.openCreateAsset = openCreateAsset;
window.closeCreateAsset = closeCreateAsset;

fetchGetAssetId();
