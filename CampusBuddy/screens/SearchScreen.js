import { StatusBar } from "expo-status-bar";
import { Component } from "react";
import { Button, StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from "react-native";
import { ListItem, SearchBar } from "react-native-elements";
import { userList, to_request, db, onSnapshot} from "../firebaseConfig";
import { auth } from "../firebaseConfig";
import Icon from 'react-native-vector-icons/Feather';
import ThemeContext from "../components/ui/ThemeContext";
import theme from "../components/ui/theme";
import { doc, getDoc, setDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Block from 'react-native-vector-icons/Entypo'

const handleRequest = (email, user_ID) => {
  to_request(auth.currentUser?.email, email, "friend", "");
  alert("Sent a request to " + user_ID);
}

const handleRequest2 = (email) => {
  to_request(auth.currentUser?.email, email, "friend", "");
  alert("Sent a request to " + email);
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
      friends: [],
      blocked: []
    };
  }
  
  count_mutual(){
    // const count = {};
    // console.log(this.state.recommend)
    // this.state.recommend.map(element => {
    //   count[element] = (count[element] || 0) + 1;
    // })
    // this.setState({recommend: count})
  }

  render_recommend ({item}) {
    return (
      <View style={[styles.item, {color: color}]}>
        <Text style={{color: color}}>
          {item}{"\n"}
        </Text>
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleRequest(item.email, item.id)}
            style={styles.touchableOpacityStyle}>
            <Icon name="user-plus" size={25} color={color}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderItem = ({ item, color }) => {
    return (
      <View style={[styles.item, {color: color}]}>
        <Text style={{ color: color }}>
          {item.first + " " + item.last + " (" + item.id + ")"}
          {'\n'}
          {item.email}
        </Text>
        {
          this.state.friends.indexOf(item.email) > -1 ?
          <View style={{flexDirection: 'row',}}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleRequest(item.email, item.id)}
                style={styles.touchableOpacityStyle}>
                <Icon name="user-check" size={25} color={color} />
            </TouchableOpacity>
            <TouchableOpacity style={{marginLeft: 10}} onPress= {() => this.block_operation(item.email)}>
              <Block name={'block'} size={25} color={color}/>
            </TouchableOpacity>
          </View>
          :
          <View style={{flexDirection: 'row',}}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleRequest(item.email, item.id)}
                style={styles.touchableOpacityStyle}>
                <Icon name="user-plus" size={25} color={color} />
            </TouchableOpacity>
            <TouchableOpacity style={{marginLeft: 10}}>
              <Block name={'block'} size={25} color={color}/>
            </TouchableOpacity>
          </View>
        }
      </View>
    );
  };

  async block_operation (email){
    const userDocRef = doc(db, "block", auth.currentUser.uid);
    const docSnap = await getDoc(userDocRef);
    const index = this.state.data.indexOf(email);
    const index2 = this.state.recommend.indexOf(email);
    if(!docSnap.exists()){
      await setDoc(userDocRef, {
        blocked_list: arrayUnion(email)
      })
      this.setState({ blocked: [...this.state.blocked, email]})    
    }else{
      updateDoc(userDocRef, {
        blocked_list: arrayUnion(email),
      });
    }
    
    if (index > -1){
      this.state.data.splice(index, 1);
    }else{
      this.state.data.splice(index2, 1);
    }
    
  }
  
  async componentDidMount() {
    const res = await userList();
    this.setState({data: res, arrayholder: res});
    const me = doc(db, "friend_list", auth.currentUser?.email);
    const block = doc(db, "block", auth.currentUser?.uid);
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

    //check if block list exists. If not, create one
    const docSnap = await getDoc(block)
    if (docSnap.exists()){
      this.setState({ blocked: docSnap.data()['blocked_list']})
    }else{
      await setDoc(block, {
        blocked_list: arrayUnion()
      })
    }
    this.state.friends.forEach((item) => {
      this.state.arrayholder.forEach((item2) => {
        if(item == item2.email){
          const friends = doc(db, "friend_list", item);
          getDoc(friends).then((snap) => {
            const data = snap.data()
            let fri =  data["friends"].map(item3 => {
              if(item3.user != auth.currentUser.email){
                return item3.user
              }else{
                return (null);
              }
            })
            let fav =  data["favorite"].map(item4 => {
              if(item4.user != auth.currentUser.email){
                return item4.user
              }else{
                return (null);
              }
            })
            const tmp = [...fri, ...fav].filter((item) => {
              return item != null
            })
            const count = [];
            tmp.forEach(element => {
              count.push({[element]: (count[element] || 0) + 1});
            })
            this.setState({recommend: [...this.state.recommend, ...count]})
          }).catch((e) => console.log(e))
        }
      })
    })
    
  }

  searchFunction = (text) => {
    const updatedData = this.state.arrayholder.filter((item) => {
      if (this.state.blocked.indexOf(item.email) == -1){
        const item_data = `${item.id.toUpperCase()})`;
        const text_data = text.toUpperCase();
        return item_data.indexOf(text_data) > -1;
      }
    });
    this.setState({ data: updatedData, searchValue: text });
  };

  render() {
    const currentTheme = theme[this.context.theme];
    const { background, color } = currentTheme;
    console.log(color)
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
            <Text style={{fontSize: 20, marginLeft: 10, marginTop: 10, color: color}}>Recommended users</Text>
            {this.state.recommend && this.state.recommend.length ? Object.keys(this.state.recommend).map((item) => Object.keys(this.state.recommend[item]).map(item2 => {
              if(this.state.blocked.indexOf(item2) == -1 ){
                console.log(this.state.blocked.indexOf(item2) == -1 )
                return (
                  <View style={[styles.item, {color: color, borderColor: color}]}>
                    <Text style={{color: color}}>
                      {item2}{"\n"}{"Mutual friends: " + this.state.recommend[item][item2]}
                    </Text>
                    <View style={{flexDirection: 'row'}}>
                      <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleRequest2(item2)}
                          style={styles.touchableOpacityStyle}>
                          <Icon name="user-plus" size={25} color={color}/>
                      </TouchableOpacity>
                      <TouchableOpacity style={{marginLeft: 10}} onPress={() => this.block_operation(item2)}>
                        <Block name="block" size={25} color={color} />
                      </TouchableOpacity>
                    </View>
               </View>
                )
              }
            })) : <Text style={{marginLeft: 10, color: color}}>No user to recommend</Text>}
            
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
    borderBottomWidth: 3,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
});