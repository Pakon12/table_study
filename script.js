
function initializeTable(rows = 30, cols = 20, data) {
    const tableBody = document.querySelector('#excelTable tbody');
    const tableHead = document.querySelector('#excelTable thead');
    const listhead = ["ลำดับ", "ชื่อ", "นามสกุล"];

    // Clear existing content of the table
    tableBody.innerHTML = '';
    tableHead.innerHTML = '';

    const columns = document.createElement('tr');
    selectsByRow = Array.from({ length: rows }, () => []);

    // Determine the number of rows based on data length
    const numRows = data ? Math.min(rows, data.length) : rows;

    for (let j = 0; j < cols; j++) {
        const cell = document.createElement('th');
        const input = document.createElement('input');
        input.type = 'date';

        if (j >= 3) {
            cell.appendChild(input);
            columns.appendChild(cell);
        }
        if (j == 0) {
            cell.textContent = `${listhead[j]}`;
            columns.appendChild(cell);
        }
        if (j == 1 || j == 2) {
            cell.textContent = `${listhead[j]}`;
            columns.appendChild(cell);
        }
        tableHead.appendChild(columns);
    }

    const dateInputs = document.querySelectorAll('input[type="date"]');
    selectsByColumn = Array.from({ length: cols - 1 }, () => []);
    

    for (let i = 0; i < numRows; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            const select = document.createElement('select');
            const option = document.createElement('option');
            const option1 = document.createElement('option');
            const option2 = document.createElement('option');
            const option3 = document.createElement('option');
            
            option.textContent = 'ยังไม่เช็ก';
            option1.textContent = 'มา';
            option2.textContent = 'ขาด';
            option3.textContent = 'ลา';

            if (j == 0) {
                input.type = 'text';
                input.id = `numberID${i + 1}`;
                // input.value = `${i + 1}`;
                input.value = data ? data[i][0] : '';
                cell.appendChild(input);
            } else if (j == 1) {
                input.type = 'text';
                input.id = `nameID${i + 1}`;
                //input.value = `ปกรณ์${i + 1}`;
                input.value = data ? data[i][1] : '';
                cell.appendChild(input);
            } else if (j == 2) {
                input.type = 'text';
                input.id = `lastID${i + 1}`;
                //input.value = `อาชาคีรี${i + 1}`;
                input.value = data ? data[i][2] : '';
                cell.appendChild(input);
            } else {
                select.disabled = true;
                select.id = `selectID${i + 1}${j}`;
                select.appendChild(option);
                select.appendChild(option1);
                select.appendChild(option2);
                select.appendChild(option3);
                

                select.addEventListener('change', function () {
                    updateAttendanceData(select, select.value);
                });

                cell.appendChild(select);
                selectsByColumn[j - 3].push(select);
            }

            row.appendChild(cell);
        }
        selectsByRow[i] = Array.from(row.children);
        tableBody.appendChild(row);
    }

    setInterval(() => {
        getdata(selectsByRow, cols);
    }, 1000);

    dateInputs.forEach((dateInput, index) => {
        dateInput.addEventListener('change', () => {
            selectsByColumn[index].forEach((select) => {
                select.disabled = !dateInput.value.trim();
            });
        });
    });
}

const column = 15
const rows = 30

// Initialize the table with 5 rows and 4 columns (you can change these values)
initializeTable(rows, column);

let attendanceData = [];

function updateAttendanceData(select, status) {
    const date = new Date();

    // Update class based on the selected option
    if (status === 'มา') {
        select.classList.add('green');
        select.classList.remove('red', 'blue');
    } else if (status === 'ขาด') {
        select.classList.add('red');
        select.classList.remove('green', 'blue');
    } else if (status === 'ลา') {
        select.classList.add('blue');
        select.classList.remove('green', 'red');
    } else {
        // Handle other cases if needed
        select.classList.remove('green', 'red', 'blue');
    }
    attendanceData.push({ date, status });
    const transformedData = transformDataForDoughnutChart(attendanceData);
    createDoughnutChart(transformedData);

    // Log the sum for each status in each column
    // const sumByStatus = calculateSumByStatus(selectsByColumn);
    // console.log('Sum by Status:', sumByStatus);
}

function calculateSumByStatus(selectsByColumn) {
    const sumByStatus = { 'มา': [], 'ขาด': [], 'ลา': [] };

    selectsByColumn.forEach((selects, columnIndex) => {
        const counts = { 'มา': 0, 'ขาด': 0, 'ลา': 0 };
        selects.forEach((select) => {
            const status = select.value;
            counts[status]++;
        });
        sumByStatus['มา'][columnIndex] = counts['มา'];
        sumByStatus['ขาด'][columnIndex] = counts['ขาด'];
        sumByStatus['ลา'][columnIndex] = counts['ลา'];
    });

    return sumByStatus;
}

function transformDataForDoughnutChart(data) {
    const result = {
        labels: ['มา', 'ขาด', 'ลา'],
        data: [0, 0, 0],
    };

    data.forEach(({ status }) => {
        if (status === 'มา') {
            result.data[0]++;
        } else if (status === 'ขาด') {
            result.data[1]++;
        } else if (status === 'ลา') {
            result.data[2]++;
        }
    });

    return result;
}
// Function to create doughnut chart
function createDoughnutChart(data) {
    const ctx = document.getElementById('attendanceDoughnutChart').getContext('2d');

    // Check if there is an existing chart instance and destroy it
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }

    // Create a span element with the count
    const count = document.createElement('span');
    count.innerText = data.data.reduce((sum, count) => sum + count, 0); // Sum of counts

    // Append the span element to a specific container in your HTML
    const countContainer = document.getElementById('countContainer'); // Replace with the actual container ID
    countContainer.innerHTML = ''; // Clear previous content
    countContainer.appendChild(count);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                ],
            }],
        },
        options: {
            title: {
                display: true,
                text: "World Wide Wine Production 2018"
            }
        },
    });
}

// ... (previous code)


async function getdata(dataRow, columns) {
    const table_student_ma_most = document.querySelector('#Table-ma');
    const table_student_kad_most = document.querySelector('#Table-kad');

    // Clear existing content of the table
    table_student_ma_most.innerHTML = '';
    table_student_kad_most.innerHTML = '';

    // Array to store data for sorting
    let rowData = [];
    let rowKad = [];

    dataRow.forEach((row, index) => {
        const numberInput = document.getElementById(`numberID${index + 1}`);
        const nameInput = document.getElementById(`nameID${index + 1}`);
        const lastInput = document.getElementById(`lastID${index + 1}`);
        let selectedOptions = [];
        for (let j = 0; j < columns - 3; j++) {
            const selected = document.getElementById(`selectID${index + 1}${j + 3}`);
            selectedOptions.push(selected ? selected.value : '');
        }

        let statusCounts = { 'มา': 0, 'ขาด': 0, 'ลา': 0 };
        selectedOptions.map((value) => {
            statusCounts[value]++;
        });

        const rowDataItem = {
            number: numberInput ? numberInput.value : '',
            name: nameInput ? nameInput.value : '',
            statusCount: statusCounts['มา'], // Count of 'มา'
        };
        const rowKadItem = {
            number: numberInput ? numberInput.value : '',
            name: nameInput ? nameInput.value : '',
            statusCount: statusCounts['ขาด'], // Count of 'มา'
        };

        rowData.push(rowDataItem);
        rowKad.push(rowKadItem)

    });

    // Sort the array based on statusCount in descending order
    rowData.sort((a, b) => b.statusCount - a.statusCount);
    rowKad.sort((a, b) => b.statusCount - a.statusCount);

    // Create table rows based on the sorted array
    rowData.forEach((rowItem, index) => {
        const show_student_ma = document.createElement('tr');
        if (index < 8) {
            show_student_ma.textContent = `${index + 1}) นาย ${rowItem.name}  ${rowItem.statusCount} วัน`;

            table_student_ma_most.appendChild(show_student_ma);
        }
    });
    rowKad.forEach((rowItem, index) => {
        const show_student_kad = document.createElement('tr');
        if (index < 8) {
            show_student_kad.textContent = `${index + 1}) นาย${rowItem.name}  ขาด ${rowItem.statusCount} วัน`;
            table_student_kad_most.appendChild(show_student_kad);
        }
    });
}




function importData() {
    const fileInput = document.getElementById('excelFileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Assuming there is only one sheet in the Excel file
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Parse the sheet data
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Now, 'jsonData' contains the Excel data as an array

            initializeTable(30, 20, jsonData)
        };

        reader.readAsArrayBuffer(file);
    } else {
        console.error('No file selected');
    }
}





function downloadExcel() {
    const savedData = loadSavedData();

    const mappedData = savedData.map(item => {
        const mappedItem = {
            'ลำดับ': item.number,
            'ชื่อ': item.name,
            'นามสกุล': item.last,
        };

        const statusCount = Object.keys(item)
            .filter(key => key.startsWith('status'))
            .reduce((acc, key) => {
                const index = key.replace('status', '');
                acc[`status${index}`] = item[key];
                return acc;
            }, {});

        console.log(`Item: ${JSON.stringify(item)}`);
        console.log(`Mapped Item: ${JSON.stringify(mappedItem)}`);
        console.log(`Status Count: ${JSON.stringify(statusCount)}`);

        return { ...mappedItem, ...statusCount };
    });

    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(mappedData);

    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Convert the workbook to a binary Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Save the file using FileSaver.js library
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = 'attendance_data.xlsx';

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // For IE
        window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
        // For other browsers
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}




document.addEventListener('DOMContentLoaded', function () {
    
    exportBtn = document.getElementById('exportBtn');


    exportBtn.addEventListener('click', () => {
        downloadExcel();
    });
});

// Function to extract data from the table
// Function to save data to localStorage
function saveDataToLocal(data) {
    localStorage.setItem('attendanceData', JSON.stringify(data));
}

// Function to extract data from the table
function extractDataFromTable() {
    const extractedData = [];

    // Iterate through the table rows
    const tableRows = document.querySelectorAll('#excelTable tbody tr');
    tableRows.forEach((row) => {
        const rowData = {};

        // Get values from the cells in the current row
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            // Assuming the first cell contains the 'ลำดับ' (number)
            // and the second and third cells contain 'ชื่อ' and 'นามสกุล'
            if (index === 0) {
                rowData.number = cell.querySelector('input').value;
            } else if (index === 1) {
                rowData.name = cell.querySelector('input').value;
            } else if (index === 2) {
                rowData.last = cell.querySelector('input').value;
            } else {
                // Assuming the rest of the cells contain status data
                const select = cell.querySelector('select');
                rowData[`status${index - 2}`] = select.value;
            }
        });

        // Push the row data to the array
        extractedData.push(rowData);
    });

    return extractedData;
}

// Function to load data from localStorage
function loadSavedData() {
    const savedData = localStorage.getItem('attendanceData');
    return savedData ? JSON.parse(savedData) : [];
}

// Function to save the current data
function saveTableData() {
    const tableData = extractDataFromTable();
    saveDataToLocal(tableData);
    alert('Table data saved successfully!');
}

// Example usage:
// Call this function when you want to save the current table data
function saveTableData() {
    const tableData = extractDataFromTable();
    saveDataToLocal(tableData);
    alert('Table data saved successfully!');
}

const saveTableDataBtn = document.getElementById('saveTableDataBtn');

saveTableDataBtn.addEventListener('click', () => {
    saveTableData();
});

