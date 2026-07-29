export function paymentReceiptTemplate(receipt: any): string {
  const logoUrl = receipt.company?.logoUrl
    ? `http://localhost:3000/uploads/companies/${receipt.company.logoUrl}`
    : '';

  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8"/>

<style>

*{
    box-sizing:border-box;
}

body{
    font-family:Arial,Helvetica,sans-serif;
    padding:40px;
    color:#111827;
    background:#ffffff;
}

.header{
    text-align:center;
    margin-bottom:30px;
}

.logo{
    width:90px;
    height:90px;
    object-fit:contain;
    margin-bottom:12px;
}

.company{
    font-size:24px;
    font-weight:bold;
}

.info{
    color:#64748b;
    margin-top:4px;
}

.receiptTitle{
    margin-top:25px;
    color:#16a34a;
    font-size:22px;
    font-weight:bold;
    letter-spacing:1px;
}

.receiptNumber{
    margin-top:10px;
    color:#475569;
    font-size:15px;
}

.notice{
    background:#ecfdf5;
    border:1px solid #86efac;
    color:#166534;
    padding:18px;
    border-radius:10px;
    margin:30px 0;
    line-height:1.6;
}

.amountCard{
    text-align:center;
    background:#f8fafc;
    border:1px solid #e2e8f0;
    border-radius:12px;
    padding:22px;
    margin-bottom:30px;
}

.amountLabel{
    color:#64748b;
    font-size:14px;
    margin-bottom:8px;
}

.amount{
    color:#16a34a;
    font-size:34px;
    font-weight:bold;
}

.sectionTitle{
    margin-bottom:12px;
    font-size:18px;
    font-weight:bold;
    color:#0f172a;
}

table{
    width:100%;
    border-collapse:collapse;
    margin-bottom:30px;
}

td{
    border-bottom:1px solid #e5e7eb;
    padding:12px;
    vertical-align:top;
}

.label{
    width:35%;
    font-weight:bold;
    color:#334155;
    background:#f8fafc;
}

.value{
    color:#111827;
}

.status{
    display:inline-block;
    padding:5px 12px;
    border-radius:999px;
    background:#dcfce7;
    color:#166534;
    font-weight:bold;
    text-transform:capitalize;
}

.footer{
    margin-top:45px;
    padding-top:20px;
    border-top:1px solid #e5e7eb;
    text-align:center;
    color:#64748b;
    font-size:13px;
    line-height:1.8;
}

</style>

</head>

<body>

<div class="header">

${logoUrl ? `<img class="logo" src="${logoUrl}" />` : ''}

<div class="company">
${receipt.company.name}
</div>

<div class="info">
${receipt.company.address ?? ''}
</div>

<div class="info">
${receipt.company.phone ?? ''}
</div>

<div class="info">
${receipt.company.email ?? ''}
</div>

<div class="receiptTitle">
PAYMENT RECEIPT
</div>

<div class="receiptNumber">
Receipt No. ${receipt.receiptNumber}
</div>

</div>

<div class="notice">
Thank you for your payment. This receipt confirms that your payment has been successfully received and recorded in our system.
</div>

<div class="amountCard">

<div class="amountLabel">
TOTAL PAID
</div>

<div class="amount">
₹${Number(receipt.amount).toLocaleString('en-IN')}
</div>

</div>

<div class="sectionTitle">
Payment Summary
</div>

<table>

<tr>
<td class="label">Equipment</td>
<td class="value">${receipt.equipment.name}</td>
</tr>

<tr>
<td class="label">Maintenance Plan</td>
<td class="value">${receipt.plan.name}</td>
</tr>

<tr>
<td class="label">Status</td>
<td class="value">
<span class="status">
${receipt.status}
</span>
</td>
</tr>

<tr>
<td class="label">Payment Method</td>
<td class="value">${receipt.method ?? '-'}</td>
</tr>

<tr>
<td class="label">Transaction Reference</td>
<td class="value">${receipt.transactionReference ?? '-'}</td>
</tr>

<tr>
<td class="label">Payment Date</td>
<td class="value">
${new Date(receipt.paymentDate).toLocaleDateString()}
</td>
</tr>

<tr>
<td class="label">Recorded By</td>
<td class="value">
${receipt.recordedBy?.name ?? '-'}
</td>
</tr>

<tr>
<td class="label">Notes</td>
<td class="value">
${receipt.notes ?? '-'}
</td>
</tr>

</table>

<div class="footer">

<strong>Thank you for choosing Hydraulic Service Platform.</strong>

<br><br>

This receipt serves as official confirmation that your payment has been received.

<br>

This document was generated automatically by the Hydraulic Service Platform.

</div>

</body>

</html>
`;
}
