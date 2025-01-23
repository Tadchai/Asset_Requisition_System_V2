function ToManageAssetPage()
{
    window.location.href = "/Frontend/ManageAsset.html"; // ใส่ URL ของหน้าที่ต้องการไป
}

function ToManageAssetInSystemPage()
{
    window.location.href = "/Frontend/ManageAssetInSystem.html"
}
function ToManageRequestReturnPage()
{
    window.location.href = "/Frontend/ManageRequestReturn.html"
}

document.addEventListener("DOMContentLoaded", async () =>
{
    const userId = localStorage.getItem("userId");
    if (!userId)
    {
        alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        return;
    }

    const url = `http://localhost:5009/User/GetUser`;

    try
    {
        const response = await fetch(url);
        if (!response.ok)
        {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayUsers(data);
    } catch (error)
    {
        console.error("Error fetching asset list:", error);
        alert("ไม่สามารถโหลดข้อมูลได้");
    }
});

document.getElementById("submitBtn").addEventListener("click", async () =>
{
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password)
    {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }

    // Default role is [1]
    const roles = [1];

    // Check if additional roles are selected
    if (document.querySelector("input[name='hr']").checked)
    {
        roles.push(2); // Assuming role ID for 'hr' is 2
    }
    if (document.querySelector("input[name='procurement']").checked)
    {
        roles.push(3); // Assuming role ID for 'procurement' is 3
    }

    const payload = {
        Username: username,
        Password: password,
        RoleId: roles,
    };

    try
    {
        const response = await fetch("http://localhost:5009/User/CreateUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.statusCode === 201)
        {
            alert(result.message || "สร้างผู้ใช้สำเร็จ");
            closeModal(); // ปิด Modal หลังจากสร้างผู้ใช้สำเร็จ
            location.reload();
        } else
        {
            alert(result.message || "เกิดข้อผิดพลาดในการสร้างผู้ใช้");
        }
    } catch (error)
    {
        console.error("Error:", error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
});

function displayUsers(data)
{
    const container = document.getElementById("asset-container");
    container.innerHTML =
        '<div class="table-header">รายชื่อผู้ใช้งานทั้งหมดในระบบ</div>'; // ล้างข้อมูลเก่าก่อน

    if (data.length === 0)
    {
        container.innerHTML += "<p>ไม่มีผู้ใช้งานในระบบ</p>";
        return;
    }

    // สร้างตาราง
    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>ลำดับที่</th>
          <th>ชื่อผู้ใช้งาน</th>
          <th>บทบาทของผู้ใช้งาน</th>
          <th>แก้ไขผู้ใช้งาน</th>
        </tr>
      </thead>
      <tbody>
        ${data
            .map(
                (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.username}</td>
            <td>${item.roleName}</td>
            <td><button class="btn-confirm" onclick="confirmAction(${item.userId})">แก้ไข</button></td>
          </tr>
        `
            )
            .join("")}
      </tbody>
    `;

    document.getElementById("editBtn").addEventListener("click", async () =>
    {
        const userId = document.getElementById("userId").value;
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (!username)
        {
            alert("กรุณากรอกชื่อผู้ใช้");
            return;
        }

        // แปลง roleName เป็น RoleId
        const roles = [1];
        if (document.getElementById("hrRole").checked) roles.push(2); // RoleId สำหรับ hr
        if (document.getElementById("procurementRole").checked) roles.push(3); // RoleId สำหรับ procurement

        const payload = {
            UserId: userId,
            Username: username,
            Password: password || undefined, // ไม่เปลี่ยนรหัสผ่านหากไม่กรอก
            RoleId: roles,
        };

        try
        {
            const response = await fetch("http://localhost:5009/User/UpdateUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.statusCode === 200)
            {
                alert(result.message || "แก้ไขผู้ใช้สำเร็จ");
                document.getElementById("submitBtn").style.display = "flex";
                document.getElementById("editBtn").style.display = "none";
                closeModal(); // ปิด Modal หลังจากแก้ไขสำเร็จ
                location.reload(); // โหลดหน้าข้อมูลใหม่
            } else
            {
                alert(result.message || "เกิดข้อผิดพลาดในการแก้ไขผู้ใช้");
            }
        } catch (error)
        {
            console.error("Error:", error);
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
        }
    });

    // เพิ่มตารางลงใน container
    container.appendChild(table);
}


// เปิด Modal
const modal = document.getElementById("myModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");

openModalBtn.onclick = () =>
{
    modal.style.display = "flex";
};

// ปิด Modal
const closeModal = () =>
{
    modal.style.display = "none";
    document.getElementById("modalTitle").textContent = "กรอกข้อมูลผู้ใช้";
};

closeModalBtn.onclick = closeModal;
cancelBtn.onclick = closeModal;

// คลิกนอก Modal เพื่อปิด
window.onclick = (event) =>
{
    if (event.target === modal)
    {
        closeModal();
    }
};

// เปิด Modal พร้อมข้อมูลเก่า
async function openEditModal(userId)
{
    // ตั้งค่า default หรือรีเซ็ตฟอร์ม
    document.getElementById("userId").value = userId || ""; // ใส่ userId ถ้าจำเป็น
    document.getElementById("username").value = ""; // เคลียร์ช่องกรอกชื่อผู้ใช้
    document.getElementById("password").value = ""; // เคลียร์ช่องกรอกรหัสผ่าน
    document.getElementById("hrRole").checked = false; // เคลียร์ checkbox
    document.getElementById("procurementRole").checked = false;

    // เปลี่ยนชื่อ Modal เป็น "แก้ไขข้อมูลผู้ใช้"
    document.getElementById("modalTitle").textContent = "แก้ไขข้อมูลผู้ใช้";

    // แสดง Modal
    modal.style.display = "flex";

    document.getElementById("editBtn").style.display = "flex";
    document.getElementById("submitBtn").style.display = "none";

}


// เพิ่มฟังก์ชันให้ปุ่มแก้ไขในตาราง
function confirmAction(userId)
{
    openEditModal(userId);
}



