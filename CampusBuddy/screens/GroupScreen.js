import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Alert,
  TouchableOpacity,
  Pressable,
  useState
} from "react-native";
import {
  addGroup,
  addMembersToGroup,
  addNicknameInGroup,
  auth,
  db,
  removeMemberFromGroup,
  getGroupSchedule
} from "../firebaseConfig";
import { FloatingAction } from "react-native-floating-action";
import {
  updateDoc,
  doc,
  arrayRemove,
  onSnapshot,
  arrayUnion,
  getDoc,
  query,
  collection,
  where,
} from "firebase/firestore";

// Working on process
// Hello World
// I'm stuck lol

export default function GroupScreen({ navigation, route }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [schedule, setSchedule] = useState([]);

  const { groups } = route.params;

  const handleOpenModal = async () => {
    const groupSchedule = await getGroupSchedule(groups.groupName);
    setSchedule(groupSchedule);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{groups.groupName}</Text>
      <FlatList
        data={groups.memberList}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity style={styles.button} onPress={handleOpenModal}>
        <Text style={styles.buttonText}>Group Schedule</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalHeader}>Group Schedule</Text>
            {schedule.length > 0 ? (
              <FlatList
                data={schedule}
                renderItem={({ item }) => (
                  <View style={styles.scheduleItem}>
                    <Text style={styles.scheduleTitle}>{item.title}</Text>
                    <Text style={styles.scheduleTime}>{item.startTime} - {item.endTime}</Text>
                    <Text style={styles.scheduleLocation}>{item.location}</Text>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            ) : (
              <Text>No events scheduled for this group.</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  group: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  groupName: {
    fontSize: 18,
  },
  addGroup: {
    flexDirection: 'row',
    marginTop: 20,
  },
  groupNameInput: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
