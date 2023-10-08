window.indexedDB =
  window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction =
  window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB) {
  alert("Your Browser doesn't support Index DB");
} else {
  alert("You're all set");
}
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded");
});
var db;
var request = window.indexedDB.open("DB1", 1);

request.onerror = function (e) {
  alert(e);
};

request.onsuccess = function (e) {
  db = request.result;
};

request.onupgradeneeded = function (e) {
  db = e.target.result;
  var objectStore = db.createObjectStore("user", {
    keyPath: "id",
  });
};
function deleteRow(row) {
  var transaction = db.transaction(["user"], "readwrite");
  var objectStore = transaction.objectStore("user");
  var id = row.cells[0].textContent;

  objectStore.delete(id);

  row.parentNode.removeChild(row);
}
function editRow(row) {
  var cells = row.cells;
  for (var i = 1; i < cells.length - 2; i++) {
    var cell = cells[i];
    var text = cell.textContent;
    cell.innerHTML = `<input type="text" value="${text}" />`;
  }
  var editButton = cells[cells.length - 1];
  editButton.innerHTML = '<button onclick="saveRow(this.parentNode.parentNode)">Save</button>';
}

function saveRow(row) {
  var id = row.cells[0].textContent;
  var name = row.cells[1].querySelector("input").value;
  var age = row.cells[2].querySelector("input").value;
  var email = row.cells[3].querySelector("input").value;

  var transaction = db.transaction(["user"], "readwrite");
  var objectStore = transaction.objectStore("user");

  var getRequest = objectStore.get(id);

  getRequest.onsuccess = function (event) {
    var userData = event.target.result;

    if (userData) {
      userData.name = name;
      userData.age = age;
      userData.email = email;

      var updateRequest = objectStore.put(userData);

      updateRequest.onsuccess = function () {
        alert(`${name} is successfully updated`);
        fetchAndDisplayData();
      };

      updateRequest.onerror = function (e) {
        alert(e);
      };
    } else {
      alert("User with ID " + id + " does not exist.");
    }
  };

  getRequest.onerror = function (e) {
    alert(e);
  };
}

function fetchAndDisplayData() {
  var transaction = db.transaction(["user"], "readonly");
  var objectStore = transaction.objectStore("user");
  var userList = document.getElementById("userList");

  userList.innerHTML = "";

  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      var id = cursor.value.id;
      var name = cursor.value.name;
      var age = cursor.value.age;
      var email = cursor.value.email;

      var newRow = userList.insertRow();
      var idCell = newRow.insertCell();
      var nameCell = newRow.insertCell();
      var ageCell = newRow.insertCell();
      var emailCell = newRow.insertCell();
      var actionCell = newRow.insertCell();
      var editButton = newRow.insertCell();

      idCell.textContent = id;
      nameCell.textContent = name;
      ageCell.textContent = age;
      emailCell.textContent = email;
      actionCell.innerHTML =
        "<button onclick='deleteRow(this.parentNode.parentNode)'>Delete</button>";
      editButton.innerHTML = "<button onclick='editRow(this.parentNode.parentNode);'>Edit</button>";

      cursor.continue();
    }
  };
}

function Save() {
  var request = db
    .transaction(["user"], "readwrite")
    .objectStore("user")
    .add({
      id: document.getElementById("id").value,
      name: document.getElementById("name").value,
      age: document.getElementById("age").value,
      email: document.getElementById("email").value,
    });

  request.onerror = function (e) {
    alert("Error in Saving User Data");
  };

  request.onsuccess = function (e) {
    fetchAndDisplayData();
  };
}

function Read() {
  var request = db
    .transaction(["user"])
    .objectStore("user")
    .get(document.getElementById("id").value);

  request.onerror = function (e) {
    alert("error reading Data");
  };

  request.onsuccess = function (e) {
    if (request.result) {
      alert(`Name : ${request.result.name} , Age : ${request.result.age}`);
    } else {
      alert("error");
    }
  };
}
