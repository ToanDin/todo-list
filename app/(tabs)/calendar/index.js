import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { Calendar } from "react-native-calendars";
import { FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';

const Index = () => {
  const today = moment().format("YYYY-MM-DD");
  const [selectedDate, setSelectedDate] = useState(today);
  const [todos, setTodos] = useState([]);

  const fetchCompletedTodos = async () => {
    try {
      const todosRef = collection(db, 'todos');

      const q = query(
        todosRef
      );

      const querySnapshot = await getDocs(q);
      const completedTodos = [];
      querySnapshot.forEach((doc) => {
        completedTodos.push({ id: doc.id, ...doc.data() });
      });

      setTodos(completedTodos);
    } catch (error) {
      console.error("Error fetching completed todos:", error);
    }
  };

  useEffect(() => {
    fetchCompletedTodos();
  }, []);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    fetchCompletedTodos(day.dateString);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#7CB9E8" },
        }}
      />

      <View style={{ marginTop: 20 }} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          marginVertical: 10,
          marginHorizontal: 10,
        }}
      >
        <Text>Công việc đã hoàn thành</Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="black" />
      </View>
        <ScrollView>
            {todos.length > 0 ? (
            todos.map((item) => (
              <Pressable
                style={{
                  backgroundColor: "#E0E0E0",
                  padding: 10,
                  borderRadius: 7,
                  marginVertical: 10,
                  marginHorizontal: 10,
                }}
                key={item.id}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <FontAwesome name="circle" size={18} color="gray" />
                  <Text
                    style={{
                      flex: 1,
                      textDecorationLine: "line-through",
                      color: "gray",
                    }}
                  >
                    {item.title}
                  </Text>
                  <Feather name="flag" size={20} color="gray" />
                </View>
              </Pressable>
            ))
          ) : (
            <Text style={{ margin: 10, color: "gray" }}>Không có công việc nào hoàn thành cho ngày này.</Text>
          )}
        </ScrollView>
      
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({});
