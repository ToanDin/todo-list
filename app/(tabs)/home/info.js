import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { AntDesign, Feather } from "@expo/vector-icons";
import { SimpleLineIcons } from '@expo/vector-icons';
import { db } from '../../../firebase/firebaseConfig'; 
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router"; // Thay useNavigation bằng useRouter

const Info = () => {
  const params = useLocalSearchParams();
  const router = useRouter(); // Khởi tạo router
  const [todo, setTodo] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [isOverdue, setIsOverdue] = useState(false); // Kiểm tra đã quá hạn hay chưa

  console.log(params);
  useEffect(() => {
    const docRef = doc(db, "todos", params.id);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const todoData = docSnap.data();
        setTodo(todoData);
        setCurrentTime(new Date().toLocaleString());

        if (todoData.createdAt) {
          const createdAtDate = new Date(
            todoData.createdAt.seconds * 1000 + 
            todoData.createdAt.nanoseconds / 1000000
          );
          setCreatedAt(createdAtDate.toLocaleString());
        }

        setNewNote(todoData.notes || "");

        // Tính toán thời gian còn lại cho reminder
        if (todoData.reminderTime) {
          const reminderDate = new Date(
            todoData.reminderTime.seconds * 1000 +
            todoData.reminderTime.nanoseconds / 1000000
          );
          const now = new Date();
          const timeDiff = reminderDate - now; // Thời gian còn lại (ms)
          if (timeDiff > 0) {
            const seconds = Math.floor((timeDiff / 1000) % 60);
            const minutes = Math.floor((timeDiff / 60000) % 60);
            const hours = Math.floor((timeDiff / 3600000) % 24);
            const days = Math.floor(timeDiff / 86400000);
            setRemainingTime(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            setIsOverdue(false); // Nếu thời gian còn lại, chưa quá hạn
          } else {
            setRemainingTime("Reminder expired");
            setIsOverdue(true); // Nếu quá hạn
          }
        }
      } else {
        console.log("No such document!");
      }
    });

    return () => unsubscribe();
  }, [params.id]);

  const handleSaveNote = async () => {
    try {
      const docRef = doc(db, "todos", params.id);
      await updateDoc(docRef, { notes: newNote });
      alert("Note saved!");
      setIsEditingNote(false);
    } catch (error) {
      console.error("Error updating note: ", error);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const docRef = doc(db, "todos", params.id);
      await updateDoc(docRef, { status: "success" }); // Cập nhật trạng thái thành "success"
      setTodo(prev => ({ ...prev, status: "success" })); // Cập nhật trạng thái trên giao diện
      alert("Todo marked as done!");
      //router.replace("/home/index"); // Điều hướng về trang home/index
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  if (!todo) {
    return <ActivityIndicator size="small" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white", padding: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
        <Entypo name="dots-three-vertical" size={24} color="black" />
      </View>

      <Text style={{ fontSize: 15, fontWeight: "500" }}>
        Category - {todo.category}
      </Text>

      <Text style={{ marginTop: 20, fontSize: 17, fontWeight: "600" }}>
        {todo.title}
      </Text>

      {/* Hiển thị thời gian hiện tại */}
      <View style={{ marginTop: 15 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <SimpleLineIcons name="clock" size={24} color="black" />
          <Text>Current Time</Text>
        </View>
        <Pressable style={{ backgroundColor: "#F0F0F0", padding: 7, borderRadius: 6 }}>
          <Text>{currentTime || "Not available"}</Text>
        </Pressable>
      </View>

      {/* Hiển thị thời gian đã tạo */}
      <View style={{ marginTop: 15 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <SimpleLineIcons name="note" size={24} color="black" />
          <Text>Created At</Text>
        </View>
        <Pressable style={{ backgroundColor: "#F0F0F0", padding: 7, borderRadius: 6 }}>
          <Text>{createdAt || "Not available"}</Text> 
        </Pressable>
      </View>

      {/* Hiển thị Reminder */}
      <View style={{ marginTop: 15 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <Ionicons name="time-sharp" size={24} color="gray" />
          <Text>Reminder</Text>
        </View>
        <Pressable style={{ backgroundColor: "#F0F0F0", padding: 7, borderRadius: 6 }}>
          <Text style={{ color: isOverdue ? "green" : "red" }}>
            {todo.reminder ? `Early - ${remainingTime || "Loading..."}` : "Lated"}
          </Text>
        </Pressable>
      </View>

      {/* Hiển thị Repeat Task */}
      <View style={{ marginTop: 15 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <Feather name="repeat" size={24} color="black" />
          <Text>Repeat Task</Text>
        </View>
        <Pressable style={{ backgroundColor: "#F0F0F0", padding: 7, borderRadius: 6 }}>
          <Text>{todo.repeat ? "Yes" : "No"}</Text>
        </Pressable>
      </View>

      {/* Hiển thị Notes */}
      <View style={{ marginTop: 15 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <SimpleLineIcons name="note" size={24} color="black" />
          <Text>Notes</Text>
        </View>
        {isEditingNote ? (
          <>
            <TextInput
              style={{ backgroundColor: "#F0F0F0", padding: 7, borderRadius: 6, marginTop: 5 }}
              value={newNote}
              onChangeText={setNewNote}
              placeholder="Add your notes here..."
            />
            <Pressable onPress={handleSaveNote} style={{ marginTop: 10, backgroundColor: "#007FFF", padding: 7, borderRadius: 6 }}>
              <Text style={{ color: "white", textAlign: "center" }}>Save Note</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={{ backgroundColor: "#F0F0F0", padding: 7, borderRadius: 6 }} onPress={() => setIsEditingNote(true)}>
            <Text>{todo.notes || "Not Added"}</Text>
          </Pressable>
        )}
      </View>

      {/* Nút cập nhật trạng thái */}
      <Pressable 
        style={{ backgroundColor: "#4CAF50", padding: 10, borderRadius: 6, marginTop: 20 }} 
        onPress={handleUpdateStatus}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Mark as Done</Text>
      </Pressable>

      {/* Hiển thị trạng thái */}
      <Text style={{ marginTop: 20, fontSize: 17, fontWeight: "600", color: todo.status === "success" ? "green" : "black" }}>
        Status: {todo.status || "Pending"}
      </Text>
    </View>
  );
};

export default Info;

const styles = StyleSheet.create({});
