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
function ToLoginPage()
{
    localStorage.removeItem('token');
    window.location.href = "/Frontend/login.html"
}
function getResultFromToken()
{
    let token = localStorage.getItem('token');
    if (!token)
    {
        alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        return;
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log(payload);
    return payload;
}

document.addEventListener("DOMContentLoaded", async () =>
{
    try
    {
        let token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5009/User/GetUser`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        const result = await response.json();

        if (response.status == 200)
        {
            displayUsers(result);
        } else
        {
            alert(result.message);
        }
    } catch (error)
    {
        console.error("Error fetching asset list:", error);
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

    const roles = [1];

    if (document.querySelector("input[name='hr']").checked)
    {
        roles.push(2);
    }
    if (document.querySelector("input[name='procurement']").checked)
    {
        roles.push(3);
    }

    const payload = {
        Username: username,
        Password: password,
        RoleId: roles,
    };

    try
    {
        let token = localStorage.getItem('token');
        const response = await fetch("http://localhost:5009/User/CreateUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.statusCode === 201)
        {
            alert(result.message);
            closeModal();
            location.reload();
        } else
        {
            alert(result.message);
        }
    } catch (error)
    {
        console.error("Error:", error);
    }
});

function displayUsers(data)
{
    const container = document.getElementById("asset-container");
    container.innerHTML =
        '<div class="table-header">รายชื่อผู้ใช้งานทั้งหมดในระบบ</div>';

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

        const roles = [1];
        if (document.getElementById("hrRole").checked) roles.push(2);
        if (document.getElementById("procurementRole").checked) roles.push(3);

        const payload = {
            UserId: userId,
            Username: username,
            Password: password || null,
            RoleId: roles,
        };

        try
        {
            let token = localStorage.getItem('token');
            const response = await fetch("http://localhost:5009/User/UpdateUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.statusCode === 200)
            {
                alert(result.message || "แก้ไขผู้ใช้สำเร็จ");
                document.getElementById("submitBtn").style.display = "flex";
                document.getElementById("editBtn").style.display = "none";
                closeModal();
                location.reload();
            } else
            {
                alert(result.message || "เกิดข้อผิดพลาดในการแก้ไขผู้ใช้");
            }
        } catch (error)
        {
            console.error("Error:", error);
        }
    });

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

async function openEditModal(userId)
{
    // รีเซ็ตฟอร์ม
    document.getElementById("userId").value = userId || "";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("hrRole").checked = false;
    document.getElementById("procurementRole").checked = false;

    // เปลี่ยนชื่อ Modal เป็น "แก้ไขข้อมูลผู้ใช้"
    document.getElementById("modalTitle").textContent = "แก้ไขข้อมูลผู้ใช้";

    // ซ่อนปุ่ม Submit และแสดงปุ่ม Edit
    document.getElementById("editBtn").style.display = "flex";
    document.getElementById("submitBtn").style.display = "none";

    try
    {
        const userData = getResultFromToken()
        let userId = parseInt(userData.nameid)
        let token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5009/User/GetUserById?userId=${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        if (!response.ok)
        {
            throw new Error("Failed to fetch user data");
        }

        const result = await response.json();

        // เติมข้อมูลในฟอร์ม
        document.getElementById("username").value = result.username || "";

        // ตรวจสอบและติ๊ก checkbox ตาม roleName
        const roles = result.roleName || [];
        document.getElementById("hrRole").checked = roles.includes("hr");
        document.getElementById("procurementRole").checked = roles.includes("procurement");

        // แสดง Modal หลังจากเติมข้อมูล
        document.getElementById("myModal").style.display = "flex";
    } catch (error)
    {
        console.error("Error fetching user data:", error);
    }
}




// เพิ่มฟังก์ชันให้ปุ่มแก้ไขในตาราง
function confirmAction(userId)
{
    openEditModal(userId);
}



