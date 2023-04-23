import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Alert,
  TouchableOpacity,
  Pressable,
} from "react-native";
import {
  addGroup,
  addMembersToGroup,
  addNicknameInGroup,
  auth,
  db,
  removeMemberFromGroup,
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

  const [groups, setGroups] = useState('');
  const [groupName, setGroupName] = useState('');

  // Group Id??
  // Set up an effect to retrieve the list of groups from Firebase and update state
  useEffect(() => {
    // Define a reference to the 'groups' node in the Firebase database
    const groupsRef = database().ref('groups');

    // Set up a listener for changes to the 'groups' node
    groupsRef.on('value', (snapshot) => {
      // Convert the data snapshot to an array of group objects and update state
      const data = snapshot.val();
      const groups = data ? Object.values(data) : [];
      setGroups(groups);
    });

    // Clean up the listener when the component unmounts
    return () => groupsRef.off('value');
  }, []);

//   const handleAddGroup = () => {
    // if (groupName.trim() === '') {
    //     return;
    //   }
  
    //   const newGroup = {
    //     groupName: groupName.trim(),
    //     mamberList: [],
    //   };
  
    //   database().ref(`groups/${newGroup.id}`).set(newGroup);
  
    //   setGroups([...groups, newGroup]);
    //   setGroupName('');
//   };

//   const renderItem = ({ item }) => {
//     const handleDeleteGroup = () => {
//       const filteredGroups = groups.filter((group) => group.id !== item.id);
//       setGroups(filteredGroups);
//       database().ref(`groups/${item.id}`).remove();
//     };

//     return (
//       <View style={styles.groupContainer}>
//         <TouchableOpacity
//           onPress={() =>
//             navigation.navigate('Group Details', { groupId: item.id })
//           }
//         >
//           <Text style={styles.groupName}>{item.name}</Text>
//           <Text style={styles.memberList}>
//             {item.memberList.join(', ')}
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={handleDeleteGroup}>
//           <Text style={styles.deleteButton}>Delete</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }
  const handleAddGroup = () => {
    // Define a reference to the 'groups' node in the Firebase database
    const groupsRef = database().ref('groups');

    // Generate a new ID for the new group
    const newGroupId = groupsRef.push().key;

    // Set the new group data in the database
    groupsRef.child(newGroupId).set({
      id: newGroupId,
      name: newGroup,
      memberList: [],
    });

    // Reset the newGroup state variable to clear the input field
    setNewGroup('');
  };


  // Define a function to handle deleting the group
  const renderItem = ({ item }) => {
    // Define a function to handle deleting the group
    const handleDelete = () => {
        // Define a reference to the group in the Firebase database
        const groupRef = database().ref(`groups/${item.id}`);
  
        // Remove the group from the database
        groupRef.remove();
      };
  
      // Render the group information and a delete button for the item
      return (
        <View style={styles.groupItem}>
          <Text style={styles.groupName}>{item.name}</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      );
  };

  const handleOpenModal = () => {
    // Set modalVisible state variable to true
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    // Set modalVisible state variable to false
    setModalVisible(false);
  };


  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          value={newGroup}
          onChangeText={(text) => setNewGroup(text)}
          placeholder="Add a new group"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddGroup}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.groupListContainer}>
        <FlatList
          data={groups}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>
      <TouchableOpacity style={styles.modalButton} onPress={handleOpenModal}>
        <Text style={styles.modalButtonText}>View Followed Groups</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Followed Groups</Text>
          <FlatList
            data={groups.filter((group) => group.following)}
            renderItem={({ item }) => (
              <View style={styles.modalItem}>
                <Text style={styles.modalItemName}>{item.name}</Text>
                <TouchableOpacity
                  style={styles.modalItemButton}
                  onPress={() => handleUnfollowGroup(item)}
                >
                  <Text style={styles.modalItemButtonText}>Unfollow</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={handleCloseModal}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
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
