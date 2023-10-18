document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function () {
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const checkBox = document.getElementById("inputBookIsComplete").checked;
  const isCompleted = checkBox;
  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, year, isCompleted);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

const books = [];
const RENDER_EVENT = "render-book";

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById("incompleteBookshelfList");
  uncompletedBOOKList.innerHTML = "";

  const completedBOOKList = document.getElementById("completeBookshelfList");
  completedBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) uncompletedBOOKList.append(bookElement);
    else completedBOOKList.append(bookElement);
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = bookObject.year;

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.append(textTitle, textAuthor, textYear);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("green");
    undoButton.innerText = "Belum selesai baca";

    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus buku";

    deleteButton.addEventListener("click", function () {
      removeTaskFromCompleted(bookObject.id);
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("action");
    buttonContainer.append(undoButton, deleteButton);
    container.append(buttonContainer);
  } else {
    const undoButton = document.createElement("button");
    undoButton.classList.add("green");
    undoButton.innerText = "Selesai baca";

    undoButton.addEventListener("click", function () {
      addTaskToCompleted(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus buku";

    deleteButton.addEventListener("click", function () {
      removeTaskFromCompleted(bookObject.id);
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("action");
    buttonContainer.append(undoButton, deleteButton);
    container.append(buttonContainer);
  }

  return container;
}

function addTaskToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeTaskFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = "saved-books";
const STORAGE_KEY = "BOOKSHELF_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    search();
  });
});

function search() {
  const searchValue = document.getElementById("searchBookTitle").value;
  const localStorageItem = JSON.parse(localStorage.getItem(STORAGE_KEY));

  //   if (books) {
  //     for (var i = 0; i <= localStorageItem.length; i++) {
  //       var values = localStorageItem[i].title;
  //       if (searchValue == "") {
  //         window.location.reload();
  //       }
  //       if (searchValue == values) {
  //         books.length = 0;
  //         books.push(localStorageItem[i]);
  //         // console.log(books[books.length - 1]);
  //         document.dispatchEvent(new Event(RENDER_EVENT));
  //         break;
  //       }
  //     }
  //     // console.log(localStorageItem[i]);
  //   }
  // }

  // for (const storageItems of localStorageItem) {
  //   var value = storageItems.title;
  //   if (searchValue == "") {
  //     window.location.reload();
  //     break;
  //   } else if (searchValue == value) {
  //     books.splice(0, books.length);
  //     books.push(storageItems);
  //     console.log(books);
  //     document.dispatchEvent(new Event(RENDER_EVENT));
  //     break;
  //   } else {
  //     searchAlert();
  //   }
  // }

  if (searchValue == "") {
    // jika kotak pencarian dikosongkan, tampilkan semua buku
    books.length = 0;
    for (const storagItem of localStorageItem) {
      books.push(storagItem); // tambahkan semua buku dari penyimpanan
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
  } else {
    // jika ada teks pencarian, cari buku yang sesuai
    var matchingBooks = localStorageItem.filter((book) => book.title.toLowerCase().includes(searchValue.toLowerCase()));
  }

  if (matchingBooks.length > 0) {
    books.length = 0;
    books.push(...matchingBooks); // tambahkan buku yang sesuai ke dalam daftar buku
    document.dispatchEvent(new Event(RENDER_EVENT));
  } else {
    searchAlert();
  }

  function searchAlert() {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Maaf, input tidak ditemukan!",
    });
  }
}
