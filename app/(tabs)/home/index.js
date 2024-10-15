import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState, useEffect } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { BottomModal, ModalTitle, ModalContent, SlideAnimation } from "react-native-modals";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { db } from "../../../firebase/firebaseConfig";
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, onSnapshot } from "firebase/firestore";
import moment from "moment";
import { useRouter } from "expo-router";

const Index = () => {
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const today = moment().format("MMM Do");
  const [isModalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState("Tất cả");
  const [todo, setTodo] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null); // State for editing

  const addTodo = async () => {
    try {
      const todoData = { title: todo, category: category, status: "pending", createdAt: new Date() };
      await addDoc(collection(db, "todos"), todoData);
      setModalVisible(false);
      setTodo("");
    } catch (error) {
      console.log("Lỗi khi thêm todo:", error);
    }
  };

  const updateTodo = async () => {
    if (editingTodo) {
      try {
        const todoRef = doc(db, "todos", editingTodo.id);
        await updateDoc(todoRef, { title: todo });
        setModalVisible(false);
        setTodo("");
        setEditingTodo(null);
        getUserTodos();
      } catch (error) {
        console.log("Lỗi khi cập nhật todo:", error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "todos"), where("status", "in", ["pending", "success"])),
      (querySnapshot) => {
        const fetchedTodos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTodos(fetchedTodos);
      },
      (error) => {
        console.log("Lỗi khi lắng nghe todos:", error);
      }
    );
  
    // Cleanup function to unsubscribe from listener on component unmount
    return () => unsubscribe();
  }, []);

  const getUserTodos = async () => {
    try {
      const q = query(collection(db, "todos"), where("status", "in", ["pending", "success"]));
      const querySnapshot = await getDocs(q);
      const fetchedTodos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTodos(fetchedTodos);
    } catch (error) {
      console.log("Lỗi khi lấy todos:", error);
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      await deleteDoc(doc(db, "todos", todoId));
      console.log('deleting todo: ', todoId)
      getUserTodos();
    } catch (error) {
      console.log("Lỗi khi xóa todo:", error);
    }
  };

  const markTodoAsCompleted = async (todoId) => {
    try {
      const todoRef = doc(db, "todos", todoId);
      await updateDoc(todoRef, { status: "success" });
      getUserTodos();
    } catch (error) {
      console.log("Lỗi khi đánh dấu todo là đã hoàn thành:", error);
    }
  };

  const pendingTodos = todos.filter(todo => todo.status === "pending");
  const completedTodos = todos.filter(todo => todo.status === "success");

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setTodo(todo.title);
    setModalVisible(true);
  };

  const viewTodoDetail = (todo) => {
    // console.log(todo?.id)
    router.push({
      pathname: ("/home/info"),
      params: {
        id: todo.id,
        title: todo.title,
        category: todo.category,
        status: todo.status,
        createdAt: todo.createdAt
      }
    })
    // console.log({
    //   todo: todo?.id,
    //   title: todo.title,
    //   category: today.category,
    //   status: todo.status,
    //   createdAt: todo.createdAt
    // })
  }

  return (
    <>
      <View style={styles.filterContainer}>
        <Pressable style={styles.filterButton}><Text style={styles.filterText}>Tất cả</Text></Pressable>
        <Pressable onPress={() => { setEditingTodo(null); setModalVisible(true); }}><AntDesign name="pluscircle" size={30} color="#007FFF" /></Pressable>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.todoContainer}>
          {pendingTodos.length > 0 && <Text>Các công việc đang chờ {today}</Text>}
          {pendingTodos.map((item) => (
            <Pressable key={item.id} style={styles.todoItem} onPress={() => viewTodoDetail(item)}>
              <View style={styles.todoRow}>
                <Entypo name="circle" size={18} color="black" />
                <Text style={styles.todoText}>{item.title}</Text>
                <Feather name="flag" size={20} color="black" />
                <Pressable onPress={() => handleEdit(item)}>
                  <Feather name="edit" size={20} color="black" />
                </Pressable>
                <Pressable onPress={() => deleteTodo(item.id)}>
                  <Feather name="trash" size={20} color="red" />
                </Pressable>
                {/* <Pressable onPress={() => markTodoAsCompleted(item.id)}>
                  <Feather name="check" size={20} color="green" />
                </Pressable> */}
              </View>
            </Pressable>
          ))}

          {completedTodos.length > 0 && <Text>Các công việc đã hoàn thành {today}</Text>}
          {completedTodos.map((item) => (
            <View style={styles.todoItem} key={item.id}>
              <View style={styles.todoRow}>
                <Feather name="check-circle" size={18} color="green" />
                <Text style={styles.todoText}>{item.title}</Text>
                <Feather name="flag" size={20} color="black" />
                <Pressable onPress={() => handleEdit(item)}>
                  <Feather name="edit" size={20} color="black" />
                </Pressable>
                <Pressable onPress={() => deleteTodo(item.id)}>
                  <Feather name="trash" size={20} color="red" />
                </Pressable>
              </View>
            </View>
          ))}

          {todos.length === 0 && (
            <View style={styles.emptyState}>
              <Image style={styles.emptyImage} source={{ uri: "https://cdn-icons-png.flaticon.com/128/2387/2387679.png" }} />
              <Text style={styles.emptyText}>Không có công việc nào cho hôm nay! Thêm một công việc</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomModal
        onBackdropPress={() => setModalVisible(!isModalVisible)}
        visible={isModalVisible}
        modalTitle={<ModalTitle title={editingTodo ? "Sửa todo" : "Thêm một todo"} />}
        modalAnimation={new SlideAnimation({ slideFrom: "bottom" })}
      >
        <ModalContent style={styles.modalContent}>
          <View style={styles.modalInputContainer}>
            <TextInput
              value={todo}
              onChangeText={setTodo}
              placeholder="Nhập công việc mới ở đây"
              style={styles.input}
            />
            <Ionicons onPress={editingTodo ? updateTodo : addTodo} name="send" size={24} color="#007FFF" />
          </View>
        </ModalContent>
      </BottomModal>
    </>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterButton: {
    backgroundColor: "#7CB9E8",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  filterText: {
    color: "white",
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  todoContainer: {
    marginBottom: 20,
  },
  todoItem: {
    backgroundColor: "#E0E0E0",
    padding: 10,
    borderRadius: 7,
    marginVertical: 10,
  },
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  todoText: {
    flex: 1,
    textDecorationLine: "none",
    color: "black",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 30,
  },
  emptyImage: {
    width: 100,
    height: 100,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 10,
  },
  modalContent: {
    padding: 20,
  },
  modalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
});

export default Index;
