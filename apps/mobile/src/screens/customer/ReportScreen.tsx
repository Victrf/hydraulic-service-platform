import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function ReportScreen({ route }: any) {
  const { requestId } = route.params;
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    const res = await api.get(`/reports/request/${requestId}`);
    setReport(res.data);
  };

  if (!report) return <Text>Loading...</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Service Report</Text>
      <Text>{report.notes}</Text>
    </View>
  );
}
