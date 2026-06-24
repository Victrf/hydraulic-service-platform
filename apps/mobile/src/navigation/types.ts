export type RootStackParamList = {
  Loading: undefined;
  Login: undefined;

  CustomerHome: undefined;

  Admin: undefined;
  Technician: undefined;
  Customer: undefined;
  CreateEquipment: undefined;
  AssignEquipment: { userId: string };
  Onboarding: undefined;
  ProductDetail: { id: string };

  Requests: undefined;
  RequestDetail: { requestId: string };

  MyRequests: undefined;
  CreateRequest: undefined;
  CreateCompany: undefined;

  SubscriptionDetail: {
    subscription: any;
  };

  AssignTechnician: { requestId: string };
  TechnicianWorkload: undefined;

  Jobs: undefined;
  SubmitReport: { requestId: string }; // For technicians to submit their report

  Report: { requestId: string }; // For customers to view their report
};
