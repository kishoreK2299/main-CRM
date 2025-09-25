document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const generateBtn = document.getElementById('generateBtn');
    const invoiceGenerator = document.getElementById('invoice-generator');
    const invoicePreview = document.getElementById('invoice-preview');
    const createNewBtn = document.getElementById('createNewBtn');
    const printBtn = document.getElementById('printBtn');
    
    // Set today's date
    document.getElementById('invoiceDate').valueAsDate = new Date();

    // --- EVENT LISTENERS ---
    generateBtn.addEventListener('click', () => {
        populatePreview();
        invoiceGenerator.classList.add('hidden');
        invoicePreview.classList.remove('hidden');
    });

    createNewBtn.addEventListener('click', () => {
        invoiceGenerator.classList.remove('hidden');
        invoicePreview.classList.add('hidden');
        // Optional: Reset form fields here
    });
    
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // --- MAIN FUNCTION ---
    function populatePreview() {
        // --- basic info ---
        document.getElementById('preview-invoiceCode').textContent = document.getElementById('invoiceCode').value;
        document.getElementById('preview-invoiceDate').textContent = document.getElementById('invoiceDate').value;
        document.getElementById('preview-clientName').textContent = document.getElementById('clientName').value;
        document.getElementById('preview-clientCompany').textContent = document.getElementById('clientCompany').value;
        document.getElementById('preview-clientAddress').textContent = document.getElementById('clientAddress').value;
        
        // --- table ---
        document.getElementById('preview-scope').textContent = document.getElementById('scope').value;
        document.getElementById('preview-records').textContent = document.getElementById('records').value;
        const price = parseFloat(document.getElementById('price').value) || 0;
        document.getElementById('preview-price').textContent = `$${price.toFixed(2)}`;
    }
});