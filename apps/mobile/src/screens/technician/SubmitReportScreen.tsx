import { View, Text, TextInput, Button } from "react-native";
import { useState } from "react";
import { api } from "../../api/client";

export default function SubmitReportScreen({ route }: any) {
  const { requestId } = route.params;
  const [reportText, setReportText] = useState("");

  const submit = async () => {
    try {
      await api.post("/reports", {
        serviceRequestId: requestId,
        reportText,
      });

      await api.patch(`/service-requests/${requestId}/status`, {
        status: "completed",
      });

      alert("Report submitted");
    } catch (err) {
      console.log(err);
      alert("Failed to submit report");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Submit Report</Text>

      <TextInput
        multiline
        value={reportText}
        onChangeText={setReportText}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 20,
        }}
      />

      <Button title="Submit Report" onPress={submit} />
    </View>
  );
}
