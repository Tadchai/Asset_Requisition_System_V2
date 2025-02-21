import { API_URL } from "/Frontend/assets/config.js";

export function padNumber(id, length) {
  return id.toString().padStart(length, "0");
}

export async function loadCategories() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/Item/GetCategory`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const categories = await response.json();

    const select = document.getElementById("categoryId");
    select.innerHTML =
      `<option value="">-</option>` +
      categories
        .map(
          (cat) =>
            `<option value="${cat.categoryId}">${cat.categoryName}</option>`
        )
        .join("");
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

export async function loadClassification() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/Item/GetClassification`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const classification = await response.json();

    const select = document.getElementById("classificationId");
    select.innerHTML =
      `<option value="">-</option>` +
      classification
        .map(
          (cat) =>
            `<option value="${cat.classificationId}">${cat.classificationName}</option>`
        )
        .join("");
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

export async function loadUsersFromData() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/User/GetUser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const users = await response.json();

    const userSelect = document.getElementById("userId");

    userSelect.innerHTML =
      `<option value="">-</option>` +
      users
        .map(
          (u) =>
            `<option value="${u.userId}">${u.firstName} ${u.lastName}</option>`
        )
        .join("");
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

export async function loadProcurersFromData() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/User/GetProcurer`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const users = await response.json();

    const responsibleSelect = document.getElementById("responsibleId");

    responsibleSelect.innerHTML =
      `<option value="">-</option>` +
      users
        .map(
          (u) =>
            `<option value="${u.userId}">${u.firstName} ${u.lastName}</option>`
        )
        .join("");
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

export function loadDates(data) {
  if (!data || data.length === 0) return;
  const dates = data.map((item) => item.dueDate).filter((date) => date);

  if (dates.length === 0) return;

  const dateObjects = dates.map((date) => new Date(date));

  const minDate = new Date(Math.min(...dateObjects))
    .toISOString()
    .split("T")[0];
  const maxDate = new Date(Math.max(...dateObjects))
    .toISOString()
    .split("T")[0];

  const startDateInput = document.getElementById("startDueDate");
  const endDateInput = document.getElementById("endDueDate");
  if (startDateInput && endDateInput) {
    startDateInput.min = minDate;
    startDateInput.max = maxDate;
    endDateInput.min = minDate;
    endDateInput.max = maxDate;
  }
}

export async function loadName() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/User/GetUserName`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    document.getElementById(
      "yourname"
    ).textContent = `${data.firstName} ${data.lastName}`;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export function getUserRoles() {
  const token = localStorage.getItem("token");
  if (!token) return [];

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.realm_access?.roles || [];
  } catch (error) {
    console.error("Invalid token", error);
    return [];
  }
}
