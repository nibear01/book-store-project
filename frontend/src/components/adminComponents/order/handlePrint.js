export const handlePrint = (printRef, selectedOrder) => {
  if (!printRef.current) return;
  const printContent = printRef.current.innerHTML;
  const newWindow = window.open("", "_blank");
  newWindow.document.write(`
      <html>
        <head>
          <title>Order Details - ${selectedOrder?.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .print-header { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Order Details</h1>
            <p>Order #: ${selectedOrder?.order_number}</p>
          </div>
          ${printContent}
        </body>
      </html>
    `);
  newWindow.document.close();
  newWindow.print();
};
