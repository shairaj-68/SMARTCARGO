import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (invoice: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(25).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Items:');
    doc.fontSize(10);
    invoice.items.forEach((item: any) => {
      doc.text(`${item.description} - Qty: ${item.quantity} - Rate: $${item.rate} - Amount: $${item.amount}`);
    });

    doc.moveDown();
    doc.fontSize(12).text(`Subtotal: $${invoice.subtotal}`);
    doc.text(`GST (18%): $${invoice.gst}`);
    doc.text(`Commission: $${invoice.commission}`);
    doc.fontSize(14).text(`Total: $${invoice.total}`, { underline: true });

    doc.end();
  });
};
