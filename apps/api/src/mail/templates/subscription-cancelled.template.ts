export function subscriptionCancelledTemplate(subscription: any): string {
  const logoUrl = subscription.company?.logoUrl
    ? `http://localhost:3000/uploads/companies/${subscription.company.logoUrl}`
    : '';

  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8"/>

<style>

body{
    font-family:Arial,Helvetica,sans-serif;
    padding:40px;
    color:#111827;
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

.title{
    margin-top:25px;
    color:#dc2626;
    font-size:22px;
    font-weight:bold;
}

table{
    width:100%;
    border-collapse:collapse;
}

td{
    border-bottom:1px solid #e5e7eb;
    padding:12px;
}

.label{
    width:35%;
    font-weight:bold;
}

.footer{
    margin-top:40px;
    text-align:center;
    color:#64748b;
    font-size:12px;
}

.notice{
    background:#fef2f2;
    border:1px solid #fecaca;
    padding:16px;
    border-radius:10px;
    margin-bottom:20px;
}

</style>

</head>

<body>

<div class="header">

${logoUrl ? `<img class="logo" src="${logoUrl}" />` : ''}

<div class="company">
${subscription.company.name}
</div>

<div class="info">${subscription.company.address ?? ''}</div>
<div class="info">${subscription.company.phone ?? ''}</div>
<div class="info">${subscription.company.email ?? ''}</div>

<div class="title">
SUBSCRIPTION CANCELLED
</div>

</div>

<div class="notice">
Your maintenance subscription has been cancelled.
</div>

<table>

<tr>
<td class="label">Equipment</td>
<td>${subscription.equipment.name}</td>
</tr>

<tr>
<td class="label">Plan</td>
<td>${subscription.plan.name}</td>
</tr>

<tr>
<td class="label">Cancellation Date</td>
<td>${new Date(subscription.cancelledAt).toLocaleDateString()}</td>
</tr>

<tr>
<td class="label">Reason</td>
<td>${subscription.cancelledReason}</td>
</tr>

<tr>
<td class="label">Notes</td>
<td>${subscription.cancellationNotes ?? '-'}</td>
</tr>

</table>

<div class="footer">
If you wish to resume service in the future, please contact us to create a new subscription.
</div>

</body>

</html>
`;
}
