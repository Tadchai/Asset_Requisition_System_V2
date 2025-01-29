function ToManageUserPage()
{
  window.location.href = "/Frontend/ManageUser.html";
}
function ToManageAssetPage()
{
  window.location.href = "/Frontend/ManageAsset.html"
}
function ToManageRequestReturnPage()
{
  window.location.href = "/Frontend/ManageRequestReturn.html"
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
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/Item/GetAssetId`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayAssetId(data);
  } catch (error)
  {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถโหลดข้อมูลได้");
  }
});

document.getElementById("AssetSystem").addEventListener("click", async () =>
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/Item/GetAssetId`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayAssetId(data);
  } catch (error)
  {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถโหลดข้อมูลได้");
  }
});

document.getElementById("ManageCategory").addEventListener("click", async () =>
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/Item/GetCategory`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayCategory(data);
  } catch (error)
  {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถโหลดข้อมูลได้");
  }
});

document.getElementById("ManageClassification").addEventListener("click", async () =>
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/Item/GetClassification`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayClassification(data);
  } catch (error)
  {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถโหลดข้อมูลได้");
  }
});

document.getElementById("ManageInstance").addEventListener("click", async () =>
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/Item/GetInstance`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayInstance(data);
  } catch (error)
  {
    console.error("Error fetching asset list:", error);
    alert("ไม่สามารถโหลดข้อมูลได้");
  }
});


function displayAssetId(data)
{
  const container = document.getElementById("asset-container");
  container.innerHTML =
    '<div class="table-header">ทรัพย์สินทั้งหมดในระบบ</div>';

  if (data.length === 0)
  {
    container.innerHTML += "<p>ไม่มีข้อมูลทรัพย์สิน</p>";
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
          <th>แก้ไขสถานะ</th>
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
            <td>${item.username || '-'}</td>
            <td>${item.status}</td>
            <td><button class="btn-confirm" onclick="editStatusAction(${item.instanceId})">แก้ไข</button></td>
          </tr>
        `
      )
      .join("")}
      </tbody>
    `;

  container.appendChild(table);
}

function displayCategory(data)
{
  const container = document.getElementById("asset-container");
  container.innerHTML =
    `<div style="display: flex; align-items: center;">
     <div style="flex-grow: 1; text-align: center;" class="table-header">หมวดหมู่ของทรัพย์สินทั้งหมดในระบบ</div>
     <div><button id="openCategoryModalBtn">สร้างหมวดหมู่ของทรัพย์สิน</button></div></div>`;

  if (data.length === 0)
  {
    container.innerHTML += "<p>ไม่มีข้อมูลหมวดหมู่ของทรัพย์สิน</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
      <thead>
        <tr>
          <th>ลำดับที่</th>
          <th>หมวดหมู่ของทรัพย์สิน</th>
          <th>คำอธิบายของหมวดหมู่ของทรัพย์สิน</th>
          <th>แก้ไขหมวดหมู่ของทรัพย์สิน</th>
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
            <td><button class="btn-confirm" onclick="editCategoryAction(${item.categoryId})">แก้ไข</button></td>
          </tr>
        `
      )
      .join("")}
      </tbody>
    `;

  container.appendChild(table);

  const openCategoryModalBtn = document.getElementById("openCategoryModalBtn");
  if (openCategoryModalBtn)
  {
    openCategoryModalBtn.addEventListener("click", async () =>
    {
      CategoryModal.style.display = "flex";
    });
  }

  const closeModalBtn = document.getElementById("closeModalBtn");
  if (closeModalBtn)
  {
    closeModalBtn.addEventListener("click", () =>
    {
      CategoryModal.style.display = "none";
    });
  }

  submitCategory.addEventListener('click', async () =>
  {
    const CategoryName = document.getElementById('CategoryName').value;
    const CategoryDescription = document.getElementById('CategoryDescription').value;

    const requestData = {
      Name: CategoryName,
      Description: CategoryDescription
    };

    try
    {
      let token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5009/Item/CreateCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();

      if (result.statusCode === 201)
      {
        alert(result.message);
        refreshTableCategory()
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
}


function displayClassification(data)
{
  const container = document.getElementById("asset-container");
  container.innerHTML =
    `<div style="display: flex; align-items: center;">
     <div style="flex-grow: 1; text-align: center;" class="table-header">การจำแนกประเภทของทรัพย์สินทั้งหมดในระบบ</div>
     <div><button id="openClassificationModalBtn">สร้างการจำแนกประเภทของทรัพย์สิน</button></div></div>`;

  if (data.length === 0)
  {
    container.innerHTML += "<p>ไม่มีข้อมูลการจำแนกประเภทของทรัพย์สิน</p>";
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
          <th>แก้ไขการจำแนกประเภทของทรัพย์สิน</th>
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
            <td><button class="btn-confirm" onclick="editClassificationAction(${item.classificationId})">แก้ไข</button></td>
          </tr>
        `
      )
      .join("")}
      </tbody>
    `;

  container.appendChild(table);

  const openClassificationModalBtn = document.getElementById("openClassificationModalBtn");
  if (openClassificationModalBtn)
  {
    openClassificationModalBtn.addEventListener("click", async () =>
    {
      ClassificationModal.style.display = "flex";

      try
      {
        let token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5009/Item/GetCategory`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const data = await response.json();

        if (response.ok)
        {
          const SelectCategory = document.getElementById("SelectCategory");
          SelectCategory.innerHTML = '<option value="">-- กรุณาเลือกทรัพย์สิน --</option>';
          data.forEach((item) =>
          {
            const option = document.createElement("option");
            option.value = item.categoryId;
            option.textContent = `${item.categoryName}`;
            SelectCategory.appendChild(option);
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
  }

  const closeClassificationModal = document.getElementById("closeClassificationModal");
  if (closeClassificationModal)
  {
    closeClassificationModal.addEventListener("click", () =>
    {
      ClassificationModal.style.display = "none";
    });
  }

  submitClassification.addEventListener('click', async () =>
  {
    const select = SelectCategory.value;
    const ClassificationName = document.getElementById('ClassificationName').value;
    const ClassificationDescription = document.getElementById('ClassificationDescription').value;

    const requestData = {
      CategoryId: parseInt(select),
      Name: ClassificationName,
      Description: ClassificationDescription
    };

    try
    {
      let token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5009/Item/CreateClassification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });
      const result = await response.json();

      if (result.statusCode === 201)
      {
        alert(result.message);
        refreshTableClassification()
        ClassificationModal.style.display = 'none';
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
}

function displayInstance(data)
{
  const container = document.getElementById("asset-container");
  container.innerHTML =
    `<div style="display: flex; align-items: center;">
     <div style="flex-grow: 1; text-align: center;" class="table-header">รหัสทรัพย์สินทั้งหมดในระบบ</div>
     <div><button id="openInstanceModalBtn">สร้างรหัสทรัพย์สิน</button></div></div>`;

  if (data.length === 0)
  {
    container.innerHTML += "<p>ไม่มีข้อมูลรหัสทรัพย์สิน</p>";
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
          <th>แก้ไขรหัสทรัพย์สิน</th>
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
            <td><button class="btn-confirm" onclick="editInstanceAction(${item.instanceId})">แก้ไข</button></td>
          </tr>
        `
      )
      .join("")}
      </tbody>
    `;

  container.appendChild(table);

  const openInstanceModalBtn = document.getElementById("openInstanceModalBtn");
  if (openInstanceModalBtn)
  {
    openInstanceModalBtn.addEventListener("click", async () =>
    {
      InstanceModal.style.display = "flex";

      try
      {
        let token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5009/Item/GetClassification`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        const data = await response.json();

        if (response.ok)
        {
          const SelectClassification = document.getElementById("SelectClassification");
          SelectClassification.innerHTML = '<option value="">-- กรุณาเลือกการจำแนกประเภทของทรัพย์สิน --</option>';
          data.forEach((item) =>
          {
            const option = document.createElement("option");
            option.value = item.classificationId;
            option.textContent = `${item.classificationName}`;
            SelectClassification.appendChild(option);
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
  }

  const closeInstanceModal = document.getElementById("closeInstanceModal");
  if (closeInstanceModal)
  {
    closeInstanceModal.addEventListener("click", () =>
    {
      InstanceModal.style.display = "none";
    });
  }

  submitInstance.addEventListener('click', async () =>
  {
    const select = SelectClassification.value;
    const InstanceName = document.getElementById('InstanceName').value;

    const requestData = {
      ClassificationId: parseInt(select),
      AssetId: InstanceName
    };

    try
    {
      let token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5009/Item/CreateInstance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });
      const result = await response.json();

      if (result.statusCode === 201)
      {
        alert(result.message);
        refreshTableInstance()
        InstanceModal.style.display = 'none';
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
}


async function refreshTableAssetId()
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/Item/GetAssetId`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error("Failed to fetch updated data");
    }
    const data = await response.json();
    displayAssetId(data);
  } catch (error)
  {
    console.error("Error refreshing table:", error);
  }
}

async function refreshTableCategory()
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/Item/GetCategory`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error("Failed to fetch updated data");
    }
    const data = await response.json();
    displayCategory(data);
  } catch (error)
  {
    console.error("Error refreshing table:", error);
  }
}

async function refreshTableClassification()
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/Item/GetClassification`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error("Failed to fetch updated data");
    }
    const data = await response.json();
    displayClassification(data);
  } catch (error)
  {
    console.error("Error refreshing table:", error);
  }
}

async function refreshTableInstance()
{
  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/Item/GetInstance`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error("Failed to fetch updated data");
    }
    const data = await response.json();
    displayInstance(data);
  } catch (error)
  {
    console.error("Error refreshing table:", error);
  }
}


async function editCategoryAction(categoryId)
{
  const modal = document.getElementById("CategoryEditModal");
  modal.style.display = "flex";


  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/Item/GetCategoryById?categoryId=${categoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const categoryData = await response.json();


    document.getElementById("CategoryEditName").value = categoryData.categoryName;
    document.getElementById("CategoryEditDescription").value = categoryData.description;
  } catch (error)
  {
    console.error("Error fetching category data:", error);
    alert("ไม่สามารถโหลดข้อมูลหมวดหมู่ได้");
  }

  document.getElementById("submitEditCategory").onclick = async () =>
  {
    const name = document.getElementById("CategoryEditName").value;
    const description = document.getElementById("CategoryEditDescription").value;

    const payload = {
      CategoryId: categoryId,
      Name: name,
      Description: description,
    };

    try
    {
      let token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5009/Item/UpdateCategory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok)
      {
        alert(result.message);
        modal.style.display = "none"; 
        refreshTableCategory()
      } else
      {
        alert(result.message || "Failed to update category.");
      }
    } catch (error)
    {
      console.error("Error:", error);
      alert("An error occurred while connecting to the server.");
    }
  };
}
document.getElementById("closeEditModalBtn").addEventListener("click", () =>
{
  document.getElementById("CategoryEditName").value = "";
  document.getElementById("CategoryEditDescription").value = "";
  CategoryEditModal.style.display = "none";
});


async function editClassificationAction(classificationId)
{
  const modal = document.getElementById("ClassificationEditModal");
  modal.style.display = "flex";


  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/Item/GetClassificationById?classificationId=${classificationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ClassificationData = await response.json();

    document.getElementById("ClassificationEditName").value = ClassificationData.classificationName;
    document.getElementById("ClassificationEditDescription").value = ClassificationData.description;

  } catch (error)
  {
    console.error("Error fetching Classification data:", error);
    alert("ไม่สามารถโหลดข้อมูลหมวดหมู่ได้");
  }

  document.getElementById("submitEditClassification").onclick = async () =>
  {
    const name = document.getElementById("ClassificationEditName").value;
    const description = document.getElementById("ClassificationEditDescription").value;

    const payload = {
      ClassificationId: classificationId,
      Name: name,
      Description: description,
    };

    try
    {
      let token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5009/Item/UpdateClassification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok)
      {
        alert(result.message);
        modal.style.display = "none";
        refreshTableClassification()
      } else
      {
        alert(result.message || "Failed to update Classification.");
      }
    } catch (error)
    {
      console.error("Error:", error);
      alert("An error occurred while connecting to the server.");
    }
  };
}
document.getElementById("closeEditClassificationModal").addEventListener("click", () =>
{
  document.getElementById("ClassificationEditName").value = "";
  document.getElementById("ClassificationEditDescription").value = "";
  ClassificationEditModal.style.display = "none";
});

async function editInstanceAction(instanceId)
{
  const modal = document.getElementById("InstanceEditModal");
  modal.style.display = "flex";


  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/Item/GetInstanceById?instanceId=${instanceId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const InstanceData = await response.json();

    document.getElementById("InstanceEditName").value = InstanceData.assetId;

  } catch (error)
  {
    console.error("Error fetching Instance data:", error);
    alert("ไม่สามารถโหลดข้อมูลหมวดหมู่ได้");
  }

  document.getElementById("submitEditInstance").onclick = async () =>
  {
    const name = document.getElementById("InstanceEditName").value;

    const payload = {
      InstanceId: instanceId,
      AssetId: name
    };

    try
    {
      let token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5009/Item/UpdateInstance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok)
      {
        alert(result.message);
        modal.style.display = "none";
        refreshTableInstance()
      } else
      {
        alert(result.message || "Failed to update Instance.");
      }
    } catch (error)
    {
      console.error("Error:", error);
      alert("An error occurred while connecting to the server.");
    }
  };
}
document.getElementById("closeEditInstanceModal").addEventListener("click", () =>
{
  document.getElementById("InstanceEditName").value = "";
  InstanceEditModal.style.display = "none";
});

async function editStatusAction(instanceId)
{
  const modal = document.getElementById("AssetModal");
  modal.style.display = "flex";

  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5009/Item/GetAssetIdById?instanceId=${instanceId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok)
    {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    document.getElementById("categoryName").textContent = data.categoryName || "-";
    document.getElementById("categoryDescription").textContent = data.categoryDescription || "-";
    document.getElementById("classificationName").textContent = data.classificationName || "-";
    document.getElementById("classificationDescription").textContent = data.classificationDescription || "-";
    document.getElementById("assetId").textContent = data.assetId || "-";
    document.getElementById("username").textContent = data.username || "-";
    document.getElementById("status").textContent = data.status || "-";

    document.getElementById("btnLost").setAttribute("data-instance-id", instanceId);
    document.getElementById("btnEnd").setAttribute("data-instance-id", instanceId);
    document.getElementById("btnRestore").setAttribute("data-instance-id", instanceId);

    usernameValue = data.username;
    updateButtonVisibility()

  } catch (error)
  {
    console.error("Error fetching Instance data:", error);
    alert("ไม่สามารถโหลดข้อมูลหมวดหมู่ได้");
  }
}
document.getElementById("closeAssetModalBtn").addEventListener("click", () =>
{
  document.getElementById("categoryName").textContent = "-";
  document.getElementById("categoryDescription").textContent = "-";
  document.getElementById("classificationName").textContent = "-";
  document.getElementById("classificationDescription").textContent = "-";
  document.getElementById("assetId").textContent = "-";
  document.getElementById("username").textContent = "-";
  document.getElementById("status").textContent = "-";

  AssetModal.style.display = "none";
});

function updateButtonVisibility()
{
  const btnEnd = document.getElementById("btnEnd");
  const btnRestore = document.getElementById("btnRestore");

  if (!usernameValue)
  {
    btnEnd.style.display = "flex";
  } else
  {
    btnEnd.style.display = "none";
  }

  if (usernameValue)
  {
    btnRestore.style.display = "flex";
  } else
  {
    btnRestore.style.display = "none";
  }
}

document.getElementById("btnLost").addEventListener("click", function ()
{
  const status = this.getAttribute("data-status");
  const instanceId = this.getAttribute("data-instance-id");
  statusClick(status, instanceId);
});
document.getElementById("btnEnd").addEventListener("click", function ()
{
  const status = this.getAttribute("data-status");
  const instanceId = this.getAttribute("data-instance-id");
  statusClick(status, instanceId);
});
document.getElementById("btnRestore").addEventListener("click", function ()
{
  const status = this.getAttribute("data-status");
  const instanceId = this.getAttribute("data-instance-id");
  statusClick(status, instanceId);
});


async function statusClick(status, instanceId)
{
  const confirmData = {
    Status: parseInt(status),
    InstanceId: instanceId
  };

  try
  {
    let token = localStorage.getItem('token');
    const response = await fetch("http://localhost:5009/Item/SetAssetId", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(confirmData),
    });
    const result = await response.json();

    if (response.status == 200)
    {
      alert(result.message);
      refreshTableAssetId();
      AssetModal.style.display = "none";
    } else
    {
      alert(result.message);
    }
  } catch (error)
  {
    console.error("Error confirming request:", error);
    alert("ไม่สามารถเชื่อมต่อกับ API ได้");
  }
}