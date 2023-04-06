import { StatusBar } from "expo-status-bar";
import { Component } from "react";
import { Button, StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from "react-native";
import { ListItem, SearchBar } from "react-native-elements";
import { userList, to_request, db} from "../firebaseConfig";
import { auth } from "../firebaseConfig";
import Icon from 'react-native-vector-icons/Feather';
import ThemeContext from "../components/ui/ThemeContext";
import theme from "../components/ui/theme";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const handleRequest = (email, user_ID) => {
  to_request(auth.currentUser?.email, email, "friend", "");
  alert("Sent a request to " + user_ID);
}


export default class SearchScreen extends Component {
  static contextType = ThemeContext;
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: null,
      error: null,
      searchValue: "",
      arrayholder: "",
      recommend: [],
      friends: []
    };
  }
  
  count_mutual(){
    const count = {};
    this.state.recommend.forEach(element => {
      count[element] = (count[element] || 0) + 1;
    })
    return count;
  }

  render_recommend ({item}) {
    const result = this.count_mutual();
    console.log(item)
    return (
      <View style={styles.item}>
        <Text>
          {item}{"\n"}
        </Text>
        {
          this.state.friends.indexOf(item.email) > -1 ?
          <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert("Warning", "You guys are already friends")}
              style={styles.touchableOpacityStyle}>
              <Icon name="user-check" size={25}/>
          </TouchableOpacity>
          :
          <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleRequest(item.email, item.id)}
              style={styles.touchableOpacityStyle}>
              <Icon name="user-plus" size={25}/>
          </TouchableOpacity>
        }
      </View>
    )
  }

  renderItem = ({ item, color }) => {
    return (
      <View style={styles.item}>
        <Text style={{ color: color }}>
          {item.first + " " + item.last + " (" + item.id + ")"}
          {'\n'}
          {item.email}
        </Text>
        {
          this.state.friends.indexOf(item.email) > -1 ?
          <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert("Warning", "You guys are already friends")}
              style={styles.touchableOpacityStyle}>
              <Icon name="user-check" size={25} color={color} />
          </TouchableOpacity>
          :
          <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleRequest(item.email, item.id)}
              style={styles.touchableOpacityStyle}>
              <Icon name="user-plus" size={25} color={color} />
          </TouchableOpacity>
        }
      </View>
    );
  };

  async componentDidMount() {
    const res = await userList();
    this.setState({data: res, arrayholder: res});
    const me = doc(db, "friend_list", auth.currentUser?.email);
    await getDoc(me).then((snap) => {
      const data = snap.data()
      let fav = data["favorite"].map((item) => {
        return item.user
      })
      let fri = data["friends"].map((item) => {
        return item.user
      })     
      this.setState({friends: [...fav, ...fri]})
    })
    await this.state.friends.forEach((item) => {
      this.state.arrayholder.forEach((item2) => {
        if(item == item2.email){
          const friends = doc(db, "friend_list", item);
          getDoc(friends).then((snap) => {
            const data = snap.data()
            let fri =  data["friends"].map(item3 => {
              return item3.user
            })
            let fav =  data["favorite"].map(item4 => {
              return item4.user
            })
            this.setState({recommend: [...this.state.recommend, ...[...fav,...fri]]})
          }).catch((e) => console.log(e))
        }
      })
    })
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
    const currentTheme = theme[this.context.theme];
    const { background, color } = currentTheme;
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <SearchBar
          placeholder="Search Here..."
          round
          value={this.state.searchValue}
          onChangeText={(text) => this.searchFunction(text)}
          autoCorrect={false}
          containerStyle={{ backgroundColor: background }}
          inputContainerStyle={{ backgroundColor: background }}
          inputStyle={{ color: color }}
        />
        {
          this.state.searchValue === "" ?
          <View>
            <Text style={{fontSize: 20, marginLeft: 10, marginTop: 10}}>Recommended users</Text>
            <FlatList
              data={this.state.recommend}
              renderItem={(item) => this.render_recommend({...item, color})}
            />
            
          </View>
          :
          <FlatList
            data={this.state.data}
            renderItem={(item) => this.renderItem({...item, color})}
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