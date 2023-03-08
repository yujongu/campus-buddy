import { StatusBar } from "expo-status-bar";
import { Component } from "react";
import { Button, StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { ListItem, SearchBar } from "react-native-elements";
import { userList, to_request } from "../firebaseConfig";
import { auth } from "../firebaseConfig";
import Icon from 'react-native-vector-icons/Feather';

const handleRequest = (email, user_ID) => {
  to_request(auth.currentUser?.email, email, "friend");
  alert("Sent a request to " + user_ID);
}

const Item = ({ title }) => {
  return (
    <View style={styles.item}>
      <Text>
        {title[1] + " " + title[3] + " (" + title[2] + ")"}
        {'\n'}
        {title[0]}
      </Text>
      <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleRequest(title[0], title[2])}
          style={styles.touchableOpacityStyle}>
          <Icon name="user-plus" size={25} />
      </TouchableOpacity>
    </View>
  );
};

const renderItem = ({ item }) => <Item title={[item.email, item.first, item.id, item.last]} />;


export default class SearchScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: null,
      error: null,
      searchValue: "",
      arrayholder: ""
    };
  }

  async componentDidMount() {
    const res = await userList();
    this.setState({data: res, arrayholder: res});
  }

  searchFunction = (text) => {
    const updatedData = this.state.arrayholder.filter((item) => {
      const item_data = `${item.id.toUpperCase()})`;
      const text_data = text.toUpperCase();
      return item_data.indexOf(text_data) > -1;
    });
    this.setState({ data: updatedData, searchValue: text });
  };

  render() {
    return (
      <View style={styles.container}>
        <SearchBar
          placeholder="Search Here..."
          lightTheme
          round
          value={this.state.searchValue}
          onChangeText={(text) => this.searchFunction(text)}
          autoCorrect={false}
        />
        {
          this.state.searchValue === "" ?
          <Text style={{alignSelf: "center", paddingTop: "10%"}}>Search username</Text>
          :
          <FlatList
            data={this.state.data}
            renderItem={renderItem}
            keyExtractor={(item) => item.email}
          />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 2,
  },
  item: {
    borderBottomColor: 'black',
    borderBottomWidth: 3,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
});


