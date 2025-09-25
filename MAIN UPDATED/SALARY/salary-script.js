document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');

    generateBtn.addEventListener('click', () => {
        // --- 1. GET VALUES FROM FORM ---
        const params = {
            name: document.getElementById('empName').value,
            id: document.getElementById('empId').value,
            title: document.getElementById('empTitle').value,
            email: document.getElementById('empEmail').value,
            pan: document.getElementById('empPan').value,
            account: document.getElementById('empAccount').value,
            workingDays: document.getElementById('workingDays').value,
            lopDays: document.getElementById('lopDays').value,
            basic: document.getElementById('basicPay').value,
            allowance: document.getElementById('splAllowance').value,
            tax: document.getElementById('tax').value,
        };

        // --- 2. BUILD THE URL WITH QUERY PARAMETERS ---
        const query = new URLSearchParams(params).toString();
        
        // --- 3. NAVIGATE TO THE NEW PAGE  ---
        window.location.href = `payslip-template.html?${query}`;
    });
});