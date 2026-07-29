export function subscriptionRenewedTemplate(subscription: any): string {
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
    color:#16a34a;
    font-size:22px;
    font-weight:bold;
}

.notice{
    background:#ecfdf5;
    border:1px solid #86efac;
    padding:16px;
    border-radius:10px;
    margin:24px 0;
    color:#166534;
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
    line-height:1.8;
}

</style>

</head>

<body>

<div class="header">

${logoUrl ? `<img class="logo" src="${logoUrl}" />` : ''}

<div class="company">
${subscription.company.name}
</div>

<div class="info">
${subscription.company.address ?? ''}
</div>

<div class="info">
${subscription.company.phone ?? ''}
</div>

<div class="info">
${subscription.company.email ?? ''}
</div>

<div class="title">
SUBSCRIPTION RENEWED
</div>

</div>

<div class="notice">
Your maintenance subscription has been successfully renewed. Thank you for continuing to trust our maintenance services.
</div>

<table>

<tr>
<td class="label">Equipment</td>
<td>${subscription.equipment.name}</td>
</tr>

<tr>
<td class="label">Maintenance Plan</td>
<td>${subscription.plan.name}</td>
</tr>

<tr>
<td class="label">Start Date</td>
<td>${new Date(subscription.startDate).toLocaleDateString()}</td>
</tr>

<tr>
<td class="label">Next Service Visit</td>
<td>${new Date(subscription.nextVisitDate).toLocaleDateString()}</td>
</tr>

<tr>
<td class="label">Renewal Ends</td>
<td>${new Date(subscription.currentPeriodEnd).toLocaleDateString()}</td>
</tr>

<tr>
<td class="label">Status</td>
<td>${subscription.status}</td>
</tr>

</table>

<div class="footer">

Thank you for choosing Hydraulic Service Platform.

<br><br>

We appreciate your continued confidence in our maintenance services.

</div>

</body>

</html>
`;
}
