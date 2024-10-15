import { Image, StyleSheet, Text, View, Dimensions } from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { LineChart } from "react-native-chart-kit";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Import Firestore
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
const index = () => {
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [userName, setUserName] = useState(""); // State để lưu tên đăng nhập hoặc email

  const fetchTaskData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/todos/count");
      const { totalCompletedTodos, totalPendingTodos } = response.data;
      setCompletedTasks(totalCompletedTodos);
      setPendingTasks(totalPendingTodos);
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        // Lấy email trực tiếp từ đối tượng user nếu bạn không cần Firestore
        setUserName(user.email);

        // Nếu bạn vẫn muốn lấy từ Firestore
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid); // Truy vấn Firestore với uid
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserName(userSnap.data().username); // Lấy username từ Firestore nếu có
        } else {
          console.log("No such user document!");
        }
      } else {
        console.log("User is not logged in");
      }
    } catch (error) {
      console.log("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchTaskData();
    fetchUserData();
  }, []);

  return (
    <View style={{ padding: 10, flex: 1, backgroundColor: "white" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      
      <View style={{ width: 60, height: 60, borderRadius: 30,
        marginTop:5
       }}
         >
<MaterialCommunityIcons name="account" size={50} color="black" />
      </View>
       
        <View>
          {/* Hiển thị tên đăng nhập hoặc email từ Firebase Auth */}
          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            {userName ? ` ${userName}` : "Đang tải..."}
          </Text>
          <Text style={{ fontSize: 15, color: "gray", marginTop: 4 }}>
            Chọn danh mục
          </Text>
        </View>
      </View>

      {/* Phần còn lại của code vẫn giữ nguyên */}
      <View style={{ marginVertical: 12 }}>
        <Text>Tổng quan công việc</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginVertical: 8,
          }}
        >
          <View
            style={{
              backgroundColor: "#89CFF0",
              padding: 10,
              borderRadius: 8,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{ textAlign: "center", fontSize: 16, fontWeight: "bold" }}
            >
              {completedTasks}
            </Text>
            <Text style={{ marginTop: 4 }}>Công việc đã hoàn thành</Text>
          </View>

          <View
            style={{
              backgroundColor: "#89CFF0",
              padding: 10,
              borderRadius: 8,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{ textAlign: "center", fontSize: 16, fontWeight: "bold" }}
            >
              {pendingTasks}
            </Text>
            <Text style={{ marginTop: 4 }}>Công việc đang chờ</Text>
          </View>
        </View>
      </View>

      <LineChart
        data={{
          labels: ["Pending Tasks", "Completed Tasks"],
          datasets: [
            {
              data: [pendingTasks, completedTasks],
            },
          ],
        }}
        width={Dimensions.get("window").width - 20} // from react-native
        height={220}
        yAxisInterval={2} // optional, defaults to 1
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726",
          },
        }}
        bezier
        style={{
          borderRadius: 16,
        }}
      />

      <View
        style={{
          backgroundColor: "#89CFF0",
          padding: 10,
          borderRadius: 6,
          marginTop: 15,
        }}
      >
        <Text style={{ textAlign: "center", color: "white" }}>
          Công việc trong 7 ngày tới
        </Text>
      </View>

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <Image
          style={{ width: 120, height: 120 }}
          source={{
            uri: "https://cdn-icons-png.flaticon.com/128/9537/9537221.png",
          }}
        />
      </View>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({});
